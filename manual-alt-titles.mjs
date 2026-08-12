import fs from 'fs';

const outPath = 'src/data/movies.json';
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

const mappings = {
  'A Good Day to Ascend': ['I picked up a Good Day to Ascend', 'Feisheng Jiong Tu'],
  'Botsuraku Yotei no Kizoku dakedo, Ore ga Mahou wo Kiwamete Dou Suru': ["I'm a Noble on the Brink of Ruin, So I Might As Well Try Mastering Magic"],
  'Dekisokonai to Yobarete Motoeiyuu wa Jika Kara Tsuihou Sareta node Sukikatte ni Ikiru Koto ni Shita': ['The Banished Former Hero Lives as He Pleases'],
  'Gotoubun no Hanayome': ['The Quintessential Quintuplets'],
  'Hazurewaku no \'Joutai Ijou Skill\' de Saikyou ni Natta Ore ga Subete wo Juurin suru made': ['Failure Frame: I Became the Strongest and Annihilated Everything With Low-Level Spells', 'Failure Frame'],
  'Kimi no Koto ga Daidaidaidaidaisuki na 100-nin no Kanojo': ['The 100 Girlfriends Who Really, Really, Really, Really, Really Love You'],
  'Kimi to Boku no Saigo no Senjou (Kimisen)': ['Our Last Crusade or the Rise of a New World'],
  'Noumin Kanren no Skill bakka Agetetara Nazeka Tsuyoku Natta': ["I've Somehow Gotten Stronger When I Improved My Farm-Related Skills"],
  'Seiken Gakuin no Makentsukai': ['The Demon Sword Master of Excalibur Academy'],
  'Shinmai Ossan Boukensha, Saikyou Party ni Shinu hodo Kitaerarete Muteki ni Naru.': ['The Ossan Newbie Adventurer, Trained to Death by the Most Powerful Party, Became Invincible'],
  'Tokidoki Bosotto Russia-go de Dereru Tonari no Alya-san': ['Alya Sometimes Hides Her Feelings in Russian', 'Roshidere'],
  'Yuusha Party wo Oidasareta Kiyoubinbou': ["The Jack-of-all-trades Is Kicked Out of the Hero's Party", 'Kiyoubinbou']
};

for (const title in mappings) {
  const m = movies.find(m => m.title === title);
  if (m) {
    m.altTitles = mappings[title];
  }
}

fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
console.log('Fixed manually.');
