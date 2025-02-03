const fs = require('fs');
const path = require('path');
const https = require('https');

async function fetchSpeedData() {
  return new Promise((resolve, reject) => {
    https.get('https://www.17lands.com/data/play_draw', (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          // 转换数据格式，只保留需要的字段
          const transformedData = jsonData.data.map(item => ({
            expansion: item.expansion,
            event_type: item.event_type,
            average_game_length: item.average_game_length,
            win_rate_on_play: item.win_rate_on_play
          }));
          resolve(transformedData);
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
    console.log('Fetching speed data...');
    const data = await fetchSpeedData();
    
    // 确保目录存在
    const dir = path.join(__dirname, '../app/speed');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 写入数据
    fs.writeFileSync(
      path.join(dir, 'speed-data.json'),
      JSON.stringify(data, null, 2)
    );
    
    console.log('Speed data has been saved successfully!');
  } catch (error) {
    console.error('Error fetching speed data:', error);
    process.exit(1);
  }
}

main(); 