fetch('https://ipt.biodiversidad.co/sib/resource?r=mamiferos_col')
  .then(res => res.text())
  .then(html => {
    const pat = /href="([^"]*archive\.do\?r=[^"]+)"/gi;
    let match;
    while ((match = pat.exec(html)) !== null) {
      console.log('MATCH:', match[1]);
    }
  })
