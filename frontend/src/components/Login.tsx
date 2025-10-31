import React, { useState } from 'react';
import { buildPath } from './Path';
import { storeToken } from '../tokenStorage';
//import { jwtDecode } from 'jwt-decode';

import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from 'jwt-decode'; // Add 'type' keyword

import './Login.css'

// Add this interface
interface CustomJwtPayload extends JwtPayload {
    userId: string;
    firstName: string;
    lastName: string;
}

function Login()
{
  const [message,setMessage] = useState('');
  const [loginName,setLoginName] = React.useState('');
  const [loginPassword,setPassword] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');

  const [isLogin, setIsLogin] = useState(true);

    async function doLogin(event:any) : Promise<void>
    {
        event.preventDefault();

        var obj = {login:loginName,password:loginPassword};
        var js = JSON.stringify(obj);

        try
        {    
          const response = await fetch(buildPath('/api/login'), {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
  
          //var res = JSON.parse(await response.text());
          var res = await response.json();

          //Checks if login was successful (accessToken exists)
        if (!res.accessToken) {
            // No token means login failed
            setMessage('User/Password combination incorrect');
            return;
        }

          const { accessToken } = res;
          storeToken( accessToken );

          //Uses the custom type
          const decoded = jwtDecode<CustomJwtPayload>(accessToken);

        try
        {
          var ud = decoded;
          var userId = parseInt(ud.userId);
          var firstName = ud.firstName;
          var lastName = ud.lastName;

          if( userId <= 0 )
          {
            setMessage('User/Password combination incorrect');
          }
          else
          {
            var user = {firstName:firstName,lastName:lastName,id:userId}
            localStorage.setItem('user_data', JSON.stringify(user));
      
            setMessage('');
            window.location.href = '/cards';
          }
          }
          catch(e)
          {
            console.log( e );
            return;
          }
        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }    
      };

    function handleSetLoginName( e: any ) : void
    {
      setLoginName( e.target.value );
    }

    function handleSetPassword( e: any ) : void
    {
      setPassword( e.target.value );
    }

    return(
      <div id="loginDiv">
        {isLogin ? (
          <>
          <h3 id="inner-title">Login</h3><br />
          <input className='auth-field' type="text" id="loginName" placeholder="Username" onChange={handleSetLoginName} /><br />
          <input className='auth-field' type="password" id="loginPassword" placeholder="Password" onChange={handleSetPassword} /><br />
          <input type="submit" id="loginButton" className="buttons" value = "Login" onClick={doLogin} /><br />
          <span id="loginResult">{message}</span>
          <p className='login-toggle'>
            Don't have an account? &nbsp;
            <a className='login-toggle-link' onClick={() => setIsLogin(false)}>Sign Up</a>
          </p>
          </>
        ) : (
          <>
          <h3 id="inner-title">Sign Up</h3><br />
          <input className='auth-field' type='text' id='firstName' placeholder='First Name' /><br />
          <input className='auth-field' type='text' id='lastName' placeholder='Last Name' /><br />
          <input className='auth-field' type='text' id='email' placeholder='Email' /><br />
          <input className='auth-field' type="text" id="loginName" placeholder="Username" onChange={handleSetLoginName} /><br />
          <input className='auth-field' type="password" id="loginPassword" placeholder="Password" onChange={handleSetPassword} /><br />
          <input type="submit" id="loginButton" className="buttons" value = "Sign Up" onClick={doLogin} /><br />
          <span id="loginResult">{message}</span>
          <p className='login-toggle'>
            Already have an account? &nbsp;
            <a className='login-toggle-link' onClick={() => setIsLogin(true)}>Login</a>
          </p>
          </>
        )}
      </div>
    );
};

export default Login;
