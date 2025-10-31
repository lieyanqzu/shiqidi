const fs = require('fs');
const path = require('path');
const https = require('https');

async function fetchFilterData() {
  return new Promise((resolve, reject) => {
    https.get('https://www.17lands.com/data/filters', (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  try {
    console.log('Fetching expansion metadata...');
    const data = await fetchFilterData();
    
    // 确保目录存在
    const dir = path.join(__dirname, '../data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 写入数据
    fs.writeFileSync(
      path.join(dir, 'filter.json'),
      JSON.stringify(data, null, 2)
    );
    
    console.log('Expansion metadata has been saved successfully!');
  } catch (error) {
    console.error('Error fetching expansion metadata:', error);
    process.exit(1);
  }
}

main();

