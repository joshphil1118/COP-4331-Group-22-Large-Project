require('express');
require('mongodb');

exports.setApp = function ( app, client )
{

	app.post('/api/addcard', async (req, res, next) =>
    {
      // incoming: userId, color
      // outgoing: error
        
      const { userId, card, jwtToken } = req.body;

      try
      {
        if( token.isExpired(jwtToken))
        {
          var r = {error:'The JWT is no longer valid', jwtToken: ''};
          res.status(200).json(r);
          return;
        }
      }
      catch(e)
      {
        console.log(e.message);
      }
    
      const newCard = {Card:card,UserId:userId};
      var error = '';
    
      try
      {
        const db = client.db('COP4331Cards');
        const result = await db.collection('Cards').insertOne(newCard);
      }
      catch(e)
      {
        error = e.toString();
      }
    
      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
    
      var ret = { error: error, jwtToken: refreshedToken };
      
      res.status(200).json(ret);
  });

	app.post('/api/login', async (req, res, next) => 
	{
	  // incoming: login, password
	  // outgoing: id, firstName, lastName, error
		
	 var error = '';

	  const { login, password } = req.body;

	  const db = client.db('COP4331Cards');
	  const results = await db.collection('Users').find({Login:login,Password:password}).toArray();

	  var id = -1;
	  var fn = '';
	  var ln = '';
    var status = '0';

	  var ret;

	  if( results.length > 0 )
	  {
		  id = results[0].UserID;
		  fn = results[0].FirstName;
		  ln = results[0].LastName;
      status = results[0].Status;

      //email check
      if( status !== '1' )
      {
        return res.status(200).json({ error: 'Please verify your email before logging in' });
      }

		  try
		  {
			  const token = require("./createJWT.js");
			  ret = token.createToken( fn, ln, id );
		  }
		  catch
		  {
			  ret = {error: e.message};
		  }
	  }
	  else
	  {
		  ret = {error: "Login/Password incorrect"};
	  }

	  res.status(200).json(ret);
	});

	app.post('/api/searchcards', async (req, res, next) => 
    {
      // incoming: userId, search
      // outgoing: results[], error
    
      var error = '';
    
      const { userId, search, jwtToken } = req.body;

      try
      {
        if( token.isExpired(jwtToken))
        {
          var r = {error:'The JWT is no longer valid', jwtToken: ''};
          res.status(200).json(r);
          return;
        }
      }
      catch(e)
      {
        console.log(e.message);
      }
      
      var _search = search.trim();
      
      const db = client.db('COP4331Cards');
      const results = await db.collection('Cards').find({"Card":{$regex:_search+'.*', $options:'i'}}).toArray();
      
      var _ret = [];
      for( var i=0; i<results.length; i++ )
      {
        _ret.push( results[i].Card );
      }
      
      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
    
      var ret = { results:_ret, error: error, jwtToken: refreshedToken };
      
      res.status(200).json(ret);
  });

  app.post('/api/register', async (req, res, next) => 
  {
    const { firstname, lastname, login, password, email } = req.body;
    const status = '0'; // Start as unverified
    
    try {
        const db = client.db('COP4331Cards');
        
        // Check if email already exists
        const existingUser = await db.collection('Users').findOne({ $or: [{ Email: email }, { Login: login }] });
        
        if (existingUser) 
        {
          return res.status(200).json({ error: 'Email or username already exists' });
        }
        
        const newUser = { FirstName: firstname, LastName: lastname, Login: login, Password: password, Status: status, Email: email, CreatedAt: new Date() };
        
        const result = await db.collection('Users').insertOne(newUser);
        const userId = result.insertedId.toString();
        
        // Send verification email
        const emailSent = await require('./emailVerification.js').sendVerificationEmail(email, firstname, userId);
        
        if (!emailSent) 
        {
          console.log('Failed to send verification email, but user was created');
        }
        
        var ret = { 
            error: '', 
            message: 'Registration successful! Please check your email to verify your account.',
            id: userId,
            firstName: firstname,
            lastName: lastname,
            status: status
        };
        
        res.status(200).json(ret);
        
    } catch(e) {
        var ret = { error: e.toString() };
        res.status(200).json(ret);
    }
});

app.get('/api/verify-email', async (req, res, next) => {
    const { token } = req.query;
    
    //console.log('Verification token received');
    
    try {
        if (!token) 
        {
          return res.status(400).send('No token provided');
        }
        
        const jwt = require('./createJWT.js');
        const decoded = jwt.verifyToken(token);
        
       // console.log('Decoded token:', decoded);
        
        const userId = decoded.userId;
      //  console.log('Extracted user ID:', userId);
        
        if (!userId) 
        {
          return res.status(400).send('Invalid token: no user ID found');
        }
        
        const db = client.db('COP4331Cards');
        
        const { ObjectId } = require('mongodb');
        
        let result;
        try 
        {
          result = await db.collection('Users').updateOne({ _id: new ObjectId(userId) }, { $set: { Status: '1', VerifiedAt: new Date() } });
        } 
        catch (objectIdError) 
        {
          result = await db.collection('Users').updateOne( { _id: userId }, { $set: { Status: '1', VerifiedAt: new Date() } } );
        }
        
        if (result.modifiedCount === 1) 
        {
          res.send(`
                <h2>Email Verified Successfully!</h2>
                <p>Your email has been verified. You can now <a href="/">login</a> to your account.</p>
          `);
        } 
        else 
        {
          // Check if user exists and status
          let user;
          try 
          {
            user = await db.collection('Users').findOne({ _id: new ObjectId(userId) });
          } 
          catch (e) 
          {
            user = await db.collection('Users').findOne({ _id: userId });
          }
            
          if (user) 
          {
           // console.log('User found, current status:', user.Status);
            
            if (user.Status === '1') 
            {
              res.send(`
                      <h2>Already Verified</h2>
                      <p>Your email was already verified. You can <a href="/">login</a>.</p>
              `);
            } 
            else 
            {
              res.status(400).send('User found but could not update status');
            }
            } 
            else 
            {
              res.status(400).send('User not found');
            }
        }
        
    } 
    catch (error) 
    {
     // console.error('Token verification error:', error.message);
      res.status(400).send(`Invalid or expired verification token: ${error.message}`);
    }
});

app.post('/api/resend-verification', async (req, res, next) => {
    const { email } = req.body;
    
    try {
        const db = client.db('COP4331Cards');
        const user = await db.collection('Users').findOne({ Email: email });
        
        if (!user) {
            return res.status(200).json({ error: 'Email not found' });
        }
        
        if (user.Status === '1') {
            return res.status(200).json({ error: 'Email already verified' });
        }
        
        const emailSent = await require('./emailVerification.js').sendVerificationEmail(
            user.Email, 
            user.FirstName, 
            user._id.toString()
        );
        
        if (emailSent) {
            res.status(200).json({ message: 'Verification email sent successfully' });
        } else {
            res.status(200).json({ error: 'Failed to send verification email' });
        }
        
    } catch (error) {
        res.status(200).json({ error: error.toString() });
    }
});

}
