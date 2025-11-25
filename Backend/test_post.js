const data = {
  fullname: { firstname: 'Test', lastname: 'User' },
  email: 'test@example.com',
  password: 'password123'
};

(async () => {
  try {
    const res = await fetch('http://localhost:4000/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const body = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', body);
  } catch (err) {
    console.error('Request error:', err.message);
    console.error(err);
  }
})();
