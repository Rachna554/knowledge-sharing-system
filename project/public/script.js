document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#form1');
    const signupLink = document.querySelector('#signupLink');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/auth/index', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const responseData = await response.json();

                if (response.ok) {
                    window.location.href = responseData.redirectUrl;
                } else {
                    alert(responseData.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again later.');
            }
        });
    }

    if (signupLink) {
        signupLink.addEventListener('click', () => {
            window.location.href = '/signup';
        });
    }

    document.querySelectorAll('.answer-button').forEach(button => {
        button.addEventListener('click', () => {
            const form = button.nextElementSibling;
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });
    });
});
