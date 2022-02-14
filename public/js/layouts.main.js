const logoutLink = document.querySelector('a[href="/auth/logout"]');

if ( logoutLink ) {
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();

        fetch('/auth/logout', {
            method: 'DELETE',
        }).then((res) => {
            if ( res.redirected ) {
                window.location.href = res.url;
            } else {
                window.location.href = '/auth/login';
            }
        }).catch((err) => {
            console.log(err);
        });
    });
}
