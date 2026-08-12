import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

// 1. Fill missing synopses
const synopses = {
  "A Record Of A Mortal's Journey to Immortality": "Seorang anak laki-laki biasa dari desa miskin bergabung dengan sekte kecil di Jianghu dan secara kebetulan menjadi Murid Tidak Resmi. Bagaimana seorang rakyat jelata seperti Han Li akan membangun pijakannya di sekte ini? Dengan bakat biasa-biasa saja, dia harus berhasil melintasi jalur kultivasi berbahaya dan menghindari perhatian mereka yang mungkin akan membahayakannya. Ini adalah kisah tentang manusia biasa biasa yang, bertentangan dengan segala rintangan, bentrok dengan iblis jahat dan makhluk langit kuno untuk menemukan jalannya sendiri menuju keabadian.",
  "Dragon Prince Yuan": "Zhou Yuan, pangeran Kekaisaran Zhou Agung, naga sucinya dicuri saat lahir. Dengan tekad dan kekuatan kemauan yang tak tergoyahkan, ia melangkah ke jalur kultivasi, menghadapi berbagai rintangan untuk memulihkan kejayaannya dan melindungi kerajaannya. Perjalanan panjang melintasi surga dan bumi pun dimulai.",
  "Heavenly Brick Knight": "Seorang ksatria muda memulai petualangannya di dunia fantasi yang dipenuhi dengan keajaiban dan bahaya. Mengandalkan kekuatan 'Heavenly Brick' yang misterius, ia harus melawan kekuatan kegelapan dan membuktikan dirinya sebagai pahlawan sejati.",
  "In Search of God's": "Sebuah perjalanan epik untuk mencari kebenaran tentang dewa-dewa kuno. Sang tokoh utama harus melewati berbagai alam misterius, mengumpulkan artefak legendaris, dan menghadapi musuh-musuh kuat untuk mengungkap rahasia yang tersembunyi sejak zaman purba.",
  "Primeval Overlord": "Di dunia purba yang dipenuhi dengan binatang buas legendaris dan klan-klan yang saling bertarung, seorang pemuda jenius bangkit dari ketidakjelasan. Dengan menguasai teknik kultivasi primordial, ia menapaki jalan untuk menjadi penguasa tertinggi di seluruh alam semesta.",
  "Supreme Alchemy": "Di Benua Bintang Jatuh, seorang ahli alkimia jenius yang dikhianati dan dibunuh, terlahir kembali ke dalam tubuh seorang pemuda sampah. Dengan pengetahuan alkimia masa lalunya yang luar biasa, ia mulai memperbaiki nasibnya, menyempurnakan pil surgawi, dan membalas dendam kepada musuh-musuhnya.",
  "Supreme God Emperor": "Mu Yun, mantan Dewa Kaisar Tertinggi yang dikhianati, bereinkarnasi ke masa depan. Memanfaatkan pengalaman dan ingatan kehidupan masa lalunya, ia bertekad untuk kembali ke puncak, menghancurkan musuh-musuhnya, dan sekali lagi menguasai ribuan dunia.",
  "Stay Low Profile, Sect Chief": "Sebagai pemimpin sekte yang baru diangkat, ia menyadari bahwa dunia kultivasi terlalu berbahaya dan sektenya menjadi incaran banyak musuh kuat. Keputusannya: Tetap rendah hati, berkembang secara diam-diam, dan mengejutkan semua orang ketika mereka lengah!",
  "The Rich God": "Sebuah kisah tentang seorang pemuda yang memperoleh sistem kekayaan misterius yang memungkinkannya untuk mengubah uang menjadi kekuatan kultivasi. Dengan kekayaan yang tak terbatas, ia menaklukkan dunia bela diri, membeli artefak dewa, dan menghancurkan semua musuh dengan kekuatan uangnya!"
};

let synopsisCount = 0;
for (const m of movies) {
  if (synopses[m.title] && (!m.description || m.description.trim() === '')) {
    m.description = synopses[m.title];
    synopsisCount++;
  }
}

// 2. Remove broken trailers
const brokenTrailers = [
  'Dragon Prince Yuan',
  'Jade Dynasty',
  'My Senior Brother Is Too Steady',
  'Martial God Asura',
  'Martial Peak',
  'Perfect World',
  'Renegade Immortal',
  'Sword Of Coming',
  'Sword and Fairy 3',
  'Tales of Demons And Gods'
];

let brokenCount = 0;
for (const m of movies) {
  if (brokenTrailers.includes(m.title) && m.trailerId) {
    m.trailerId = ""; // Remove it so it doesn't render a broken player
    brokenCount++;
  }
}

fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
console.log(`Filled ${synopsisCount} synopses and removed ${brokenCount} broken trailers.`);
