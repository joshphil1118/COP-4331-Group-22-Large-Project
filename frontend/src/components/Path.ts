const app_name = '165.227.19.39';

export function buildPath(route: string): string {
    if (process.env.NODE_ENV !== 'development') {
        return 'http://' + app_name + ':5000/' + route;
    } else {
        return 'http://localhost:5000/' + route;
    }
}
