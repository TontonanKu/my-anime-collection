const https = require('https');
const query = encodeURIComponent('ONE PIECE ワンピース PV 東映アニメーション');
https.get('https://www.youtube.com/results?search_query=' + query, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = [...data.matchAll(/\"videoId\":\"([a-zA-Z0-9_-]{11})\"/g)];
    const ids = [...new Set(matches.map(m => m[1]))].slice(0, 10);
    ids.forEach(id => {
      https.get('https://www.youtube.com/watch?v=' + id, (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => {
          const match = data2.match(/<title>(.*?)<\/title>/);
          console.log(id, match ? match[1] : 'No title');
        });
      });
    });
  });
});
