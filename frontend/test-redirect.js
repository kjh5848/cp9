const https = require('https');

function followRedirect(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => { // Use HEAD or GET
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(res.headers.location);
      } else {
        resolve(url);
      }
    }).on('error', () => resolve(url));
  });
}

followRedirect("https://ads-partners.coupang.com/image1/zgHlevH-_GTCIx81zrUCR35VEm5CY2wnKuWGDU3VQlfk-D9TGFOYAe3tVQosxGDyMtDo5Xof1vhcr0Zu-llZBk951u-qYrCPSC0o1lS7YYz38IVxw5lNbjjxk-Wipb7_AvAnwaTKMZ35B5beqIx_wgNkJxKe5s6XNZeY8xzkQQAoaGvpwSBdpaAvQyv6Dfme08XFZ5BdPziUrKHBzCr8IjZzSRhfF-jKaHJWPf9XPZhCbOu2KI8mDePHZTKWmhjiq7NEpIsti8nY0vi7-d1yDjtxYUOzaasi9BTkWjnqPuU2Temx2iYyDtDPyZItwxs1pYQX7QyB")
  .then(url => console.log('Resolved:', url));
