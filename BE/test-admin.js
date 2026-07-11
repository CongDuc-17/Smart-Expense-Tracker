const axios = require('axios');
(async () => {
    try {
        const loginRes = await axios.post('http://localhost:3000/auth/login', {
            email: 'admin@gmail.com',
            password: 'ankara2214'
        });
        const cookies = loginRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        console.log('Login OK');
        
        try {
            const usersRes = await axios.get('http://localhost:3000/admin/test-auth', {
                headers: { Cookie: cookies }
            });
            console.log('Test auth:', usersRes.data);
        } catch (e) {
            console.log('Test auth error:', e.response?.status, e.response?.data);
        }

        try {
            const usersRes = await axios.get('http://localhost:3000/admin/users', {
                headers: { Cookie: cookies }
            });
            console.log('Users OK');
        } catch (e) {
            console.log('Users error:', e.response?.status, e.response?.data);
        }

    } catch (e) {
        console.log('Login error:', e.response?.data || e.message);
    }
})();
