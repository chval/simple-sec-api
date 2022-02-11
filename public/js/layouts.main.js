const logoutLink = document.querySelector('a[href="/auth/logout"]');

if ( logoutLink ) {
    logoutLink.addEventListener('click', (e) => {
        fetch('/auth/logout', {
            method: 'DELETE'
        }).then(() => {
            window.location = '/';
        });

        e.preventDefault();
    });
}