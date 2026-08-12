import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

// Map from the wrongly updated title BACK to the original title
const revertMap = {
  "Di Yi Xulie": "Di Yi Sulit",
  "Junzi Wu Ji": "Everything Is Fine With The Emperor",
  "Zongmen Li Chule Wo Dou Shi Wodi": "Everyone In The Sect Expect Me Is An Undercover Agent",
  "Tianting Banzhuan Xia": "Heavenly Brick Knight",
  "Sou Shen Ji (ONA)": "In Search of God's",
  "Xianwu Zhuan": "Legend Of Martial Immortal",
  "Shen Zai Jiong Tu": "Lost On Journey",
  "Shenguo Zhi Shang": "Over The Divine Kingdom",
  "Yi Zhan Cangqiong": "One Slash to the heavens",
  "Dongda Gao Wu Xueyuan": "Oriental Master Academy",
  "Taigu Shen Zun": "Primeval Overlord",
  "Zhangmen Didiao Dian": "Stay Low Profile, Sect Chief",
  "Wan Jian Wangzuo": "Throne of The Sword Master",
  "Ling Tian Du Zun": "The Legend of Ling Tian",
  "Xian Di Guilai": "The Return of The Immortal Emperor",
  "Da Zhu Zai 2": "The Great Ruler"
};

for (let movie of movies) {
  if (revertMap[movie.title]) {
    const wrongTitle = movie.title;
    const originalTitle = revertMap[movie.title];
    
    // Add the alternative title to the altTitles array if it's not already there
    if (!movie.altTitles) {
      movie.altTitles = [];
    }
    if (!movie.altTitles.includes(wrongTitle)) {
      movie.altTitles.push(wrongTitle);
    }
    
    // Revert the main title
    movie.title = originalTitle;
    console.log(`Reverted: ${wrongTitle} -> ${originalTitle}`);
  }
}

fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
console.log('Revert completed successfully!');
