(() => {
  const vocabLessonRanges = [
    [1,50],[51,100],[101,160],[161,220],[221,270],[271,320],[321,370],[371,408],[409,460],
    [461,510],[511,548],[549,580],[581,630],[631,655],[656,680],[681,740],[741,790],[791,840],
    [841,890],[891,940],[941,990],[991,1040],[1041,1090],[1091,1137],[1138,1160]
  ];

  const rawVocab = [
    [1,'人生','じんせい','cuộc sống'],[2,'人間','にんげん','con người'],[3,'人','ひと','người'],
    [4,'祖先','そせん','tổ tiên'],[5,'親戚','しんせき','họ hàng, thân thích'],[6,'夫婦','ふうふ','vợ chồng'],
    [7,'長男','ちょうなん','trưởng nam, con trai cả'],[8,'主人','しゅじん','chồng; chủ tiệm'],[9,'双子','ふたご','sinh đôi'],
    [10,'迷子','まいご','trẻ bị lạc'],[11,'他人','たにん','người khác, người dưng'],[12,'敵','てき','kẻ thù'],
    [13,'味方','みかた','phe mình, đồng minh'],[14,'筆者','ひっしゃ','tác giả'],[15,'寿命','じゅみょう','tuổi thọ'],
    [16,'将来','しょうらい','tương lai'],[17,'才能','さいのう','tài năng'],[18,'能力','のうりょく','năng lực'],
    [19,'長所','ちょうしょ','điểm mạnh, sở trường'],[20,'個性','こせい','cá tính'],[21,'遺伝','いでん','di truyền'],
    [22,'動作','どうさ','động tác, hành vi'],[23,'真似','まね','bắt chước, mô phỏng'],[24,'睡眠','すいみん','giấc ngủ'],
    [25,'食欲','しょくよく','sự thèm ăn'],[26,'外食','がいしょく','ăn ngoài'],[27,'家事','かじ','việc nhà'],
    [28,'出産','しゅっさん','sinh đẻ'],[29,'介護','かいご','chăm sóc, điều dưỡng'],[30,'共働き','ともばたらき','vợ chồng cùng đi làm'],
    [31,'出勤','しゅっきん','đi làm, có mặt tại nơi làm việc'],[32,'出世','しゅっせ','thăng tiến, thành đạt'],[33,'地位','ちい','địa vị, chức vị'],
    [34,'受験','じゅけん','dự thi, tham gia kỳ thi'],[35,'専攻','せんこう','chuyên ngành'],[36,'支度','したく','chuẩn bị, sửa soạn'],
    [37,'全身','ぜんしん','toàn thân'],[38,'しわ','しわ','nếp nhăn'],[39,'服装','ふくそう','quần áo, trang phục'],
    [40,'礼','れい','lễ, lời cảm ơn, phép lịch sự'],[41,'世辞','せじ','lời nịnh, lời khen xã giao'],[42,'言い訳','いいわけ','lời biện minh, giải thích'],
    [43,'話題','わだい','chủ đề, đề tài'],[44,'秘密','ひみつ','bí mật'],[45,'尊敬','そんけい','tôn kính'],
    [46,'謙遜','けんそん','khiêm tốn'],[47,'期待','きたい','kỳ vọng, mong chờ'],[48,'苦労','くろう','gian khổ, vất vả'],
    [49,'意志','いし','ý chí'],[50,'感情','かんじょう','cảm xúc, tình cảm'],[51,'材料','ざいりょう','nguyên liệu, vật liệu'],
    [52,'石','いし','đá'],[53,'ひも','ひも','dây'],[54,'券','けん','vé, phiếu'],[55,'名簿','めいぼ','danh sách, danh bạ'],
    [56,'表','ひょう','bảng, biểu'],[57,'針','はり','kim'],[58,'栓','せん','nút, nắp'],[59,'湯気','ゆげ','hơi nước'],
    [60,'日当たり','ひあたり','nơi có ánh sáng chiếu vào'],[61,'空','から','trống rỗng'],[62,'斜め','ななめ','nghiêng, chéo'],
    [63,'履歴','りれき','lý lịch, lịch sử'],[64,'娯楽','ごらく','giải trí'],[65,'司会','しかい','chủ trì, người dẫn chương trình'],
    [66,'歓迎','かんげい','hoan nghênh'],[67,'窓口','まどぐち','quầy giao dịch, cửa tiếp nhận'],[68,'手続き','てつづき','thủ tục, quy trình'],
    [69,'徒歩','とほ','đi bộ'],[70,'駐車','ちゅうしゃ','đỗ xe'],[71,'違反','いはん','vi phạm'],[72,'平日','へいじつ','ngày thường'],
    [73,'日付','ひづけ','ngày tháng'],[74,'日中','にっちゅう','ban ngày'],[75,'日程','にってい','lịch trình'],
    [76,'日帰り','ひがえり','đi và về trong ngày'],[77,'順序','じゅんじょ','thứ tự'],[78,'時期','じき','thời kỳ, thời điểm'],
    [79,'現在','げんざい','hiện tại'],[80,'臨時','りんじ','tạm thời, đột xuất'],[81,'費用','ひよう','chi phí'],
    [82,'定価','ていか','giá niêm yết'],[83,'割引','わりびき','giảm giá'],[84,'おまけ','おまけ','quà kèm, phần thêm'],
    [85,'無料','むりょう','miễn phí'],[86,'現金','げんきん','tiền mặt'],[87,'合計','ごうけい','tổng cộng'],
    [88,'収入','しゅうにゅう','thu nhập'],[89,'支出','ししゅつ','chi tiêu, khoản chi'],[90,'予算','よさん','dự toán, ngân sách'],
    [91,'利益','りえき','lợi nhuận, lợi ích'],[92,'赤字','あかじ','thâm hụt, lỗ'],[93,'経費','けいひ','kinh phí, chi phí'],
    [94,'勘定','かんじょう','tính tiền, thanh toán'],[95,'弁償','べんしょう','bồi thường'],[96,'請求','せいきゅう','yêu cầu, thỉnh cầu'],
    [97,'景気','けいき','tình hình kinh tế'],[98,'募金','ぼきん','quyên góp, gây quỹ'],[99,'募集','ぼしゅう','tuyển, chiêu mộ'],
    [100,'価値','かち','giá trị'],[101,'好む','このむ','thích, ưa thích'],[102,'嫌う','きらう','ghét, không thích'],
    [103,'願う','ねがう','mong, nguyện, yêu cầu'],[104,'甘える','あまえる','nũng nịu, dựa dẫm'],[105,'かわいがる','かわいがる','yêu chiều, cưng chiều'],
    [106,'気づく','きづく','nhận ra, chú ý']
  ];

  const vocabItems = (window.N2_MIMIKARA_1160 || rawVocab).map(([n,term,reading,meaning,hanViet]) => ({
    id:`n2-v-${n}`, n, term, reading, meaning, hanViet:hanViet||''
  }));

  const vocabLessons = vocabLessonRanges.map(([from,to],i) => ({
    id:`vocab-${String(i+1).padStart(2,'0')}`,
    label:`Bài ${i+1} · Từ ${from}–${to}`,
    from,to,
    source:'Mimikara Oboeru N2',
    items:vocabItems.filter(x => x.n >= from && x.n <= to)
  }));

  const kanjiSeed = [
    {id:'n2-k-01-01',char:'禁',reading:'きん',meaning:'cấm, ngăn cấm',words:'禁煙・禁止'},
    {id:'n2-k-01-02',char:'煙',reading:'けむり／えん',meaning:'khói',words:'禁煙・煙'},
    {id:'n2-k-01-03',char:'静',reading:'しずか／せい',meaning:'yên tĩnh',words:'静か・静まる'},
    {id:'n2-k-01-04',char:'危',reading:'あぶない／き',meaning:'nguy hiểm',words:'危険・危ない'},
    {id:'n2-k-01-05',char:'険',reading:'けん',meaning:'nguy, hiểm',words:'危険'},
    {id:'n2-k-01-06',char:'関',reading:'かん／せき',meaning:'liên quan, cửa ải',words:'関係・関する'},
    {id:'n2-k-01-07',char:'係',reading:'かかり／けい',meaning:'liên hệ, người phụ trách',words:'係・関係'}
  ];

  const kanjiLessons = Array.from({length:48},(_,i) => {
    const week = Math.floor(i/6)+1;
    const day = i%6+1;
    return {
      id:`kanji-w${week}-${day}`,
      label:`Tuần ${week} · Bài ${day}`,
      source:'Nihongo Soumatome N2 Kanji',
      items:i===0?kanjiSeed:[]
    };
  });

  const grammarLessons = Array.from({length:26},(_,i)=>({
    id:`grammar-${String(i+1).padStart(2,'0')}`,
    label:`Ngữ pháp B${i+1}`,
    source:'Shin Kanzen Master N2 Bunpou',
    items:[]
  }));
  grammarLessons[0].items = [
    {id:'n2-g-1-1',pattern:'～際（に）',meaning:'khi, vào dịp; dùng trong tình huống tương đối trang trọng',structure:'Nの／Vる・Vた + 際（に）',example:'海外へ行く際に、保険に入った。',blank:'海外へ行く（　）、保険に入った。'},
    {id:'n2-g-1-2',pattern:'～に際して／～にあたって',meaning:'nhân dịp, khi bắt đầu một việc quan trọng hoặc đặc biệt',structure:'N／Vる + に際して・にあたって',example:'入学に際して、必要な書類を提出してください。',blank:'入学（　）、必要な書類を提出してください。'},
    {id:'n2-g-1-3',pattern:'～たとたん（に）',meaning:'ngay đúng lúc vừa... thì một việc bất ngờ xảy ra',structure:'Vた + とたん（に）',example:'外に出たとたん、雨が降り出した。',blank:'外に出た（　）、雨が降り出した。'},
    {id:'n2-g-1-4',pattern:'～（か）と思うと／～（か）と思ったら',meaning:'vừa mới tưởng là... thì ngay sau đó đã...',structure:'Vた + （か）と思うと／と思ったら',example:'赤ちゃんは泣いたかと思うと、すぐ笑った。',blank:'赤ちゃんは泣いた（　）、すぐ笑った。'},
    {id:'n2-g-1-5',pattern:'～か～ないかのうちに',meaning:'gần như đồng thời; vừa... chưa kịp... thì...',structure:'Vる + か + Vない + かのうちに',example:'ベルが鳴るか鳴らないかのうちに、学生が教室を出た。',blank:'ベルが鳴る（　）、学生が教室を出た。'}
  ];

  const readingPlan = [
    ['対比1','練習 1'],['対比2','練習 3'],['言い換え1','練習 6'],['言い換え2','練習 8'],['比喩','練習 10'],
    ['疑問提示文1','練習 13'],['疑問提示文2','練習 15'],['主張表現1','練習 19'],['指示語','練習 21'],
    ['だれが・何が・なにを','練習 25,26'],['下線部','練習 28,29'],['理由を問う','練習 33'],['例を問う','練習 39'],
    ['広告・お知らせ・説明書き1','練習 43,48'],['中文1','練習 53'],['中文2','練習 55'],['長文1','練習 57'],
    ['長文2','練習 59'],['統合理解1','練習 62'],['統合理解2','練習 64'],['情報検索1','練習 66'],['情報検索2','練習 68']
  ];
  const readingLessons = readingPlan.map((x,i)=>({
    id:`reading-${String(i+1).padStart(2,'0')}`,
    label:`Bài ${i+1} · ${x[0]}`,
    exercise:x[1],
    source:'Shin Kanzen Master N2 Dokkai',
    text:'',
    translation:''
  }));

  window.N2_STUDY_DATA = {
    version:'2026-10-09',
    vocabTotal:1160,
    vocabImported:vocabItems.length,
    vocabLessons,
    kanjiLessons,
    grammarLessons,
    readingLessons,
    sourceNote:'Mimikara Oboeru N2: 1160 từ theo đúng thứ tự gốc; chia 25 bài dựa trên lộ trình N2 55 buổi của KOSEI.'
  };
})();