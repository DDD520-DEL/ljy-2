export const JOINT_TYPES = {
  straight: {
    id: 'straight',
    name: '直榫',
    description: '最基础的榫卯形式，榫头呈矩形插入卯口',
    knowledge: {
      history: '直榫是中国木作中最古老、最基础的榫卯形式，其使用可追溯至距今七千年前的河姆渡文化遗址。考古发现，新石器时代的干栏式建筑中已出现成熟的直榫结构。历经商周、秦汉至明清，直榫始终是家具与建筑木作中最常用的连接方式，被誉为"万榫之母"。',
      principle: '直榫由榫头（凸出部分）和卯眼（凹入部分）组成。榫头通常加工成矩形断面，沿木纹方向切削而成，卯眼则在对应木料上凿出相应的矩形孔洞。连接时榫头插入卯眼，依靠木材本身的摩擦力和少量胶合剂实现牢固结合。榫头宽度通常为木料宽度的1/2至2/3，厚度为木料厚度的1/3至1/2，以确保结构强度。',
      applications: ['桌椅腿与桌面的连接', '柜门边框的角部拼接', '床架横梁与立柱的结合', '书架层板与侧板的固定', '建筑木构架中梁与柱的连接']
    },
    params: [
      { key: 'sectionW', name: '木料截面宽', min: 30, max: 150, default: 60, unit: 'mm' },
      { key: 'sectionH', name: '木料截面高', min: 30, max: 150, default: 80, unit: 'mm' },
      { key: 'tenonLength', name: '榫头长度', min: 10, max: 80, default: 35, unit: 'mm' },
      { key: 'tenonWidthRatio', name: '榫头宽比', min: 0.3, max: 0.9, default: 0.6, step: 0.05 },
      { key: 'tenonHeightRatio', name: '榫头高比', min: 0.3, max: 0.9, default: 0.5, step: 0.05 },
      { key: 'shoulderRatio', name: '榫肩比例', min: 0.1, max: 0.5, default: 0.2, step: 0.05 }
    ],
    presets: [
      {
        id: 'straight-standard',
        name: '标准规格',
        builtIn: true,
        description: '适用于一般家具框架',
        params: { sectionW: 60, sectionH: 80, tenonLength: 35, tenonWidthRatio: 0.6, tenonHeightRatio: 0.5, shoulderRatio: 0.2 }
      },
      {
        id: 'straight-heavy',
        name: '加粗型',
        builtIn: true,
        description: '承重结构用，榫头粗大结实',
        params: { sectionW: 100, sectionH: 120, tenonLength: 55, tenonWidthRatio: 0.7, tenonHeightRatio: 0.6, shoulderRatio: 0.15 }
      },
      {
        id: 'straight-light',
        name: '轻巧型',
        builtIn: true,
        description: '装饰性小件，精致美观',
        params: { sectionW: 40, sectionH: 50, tenonLength: 20, tenonWidthRatio: 0.5, tenonHeightRatio: 0.45, shoulderRatio: 0.25 }
      }
    ]
  },
  dovetail: {
    id: 'dovetail',
    name: '燕尾榫',
    description: '鸠尾形榫头，越拉越紧，常用于抽屉等受拉部位',
    knowledge: {
      history: '燕尾榫古称"燕尾"、"鸠尾榫"，是中国传统木作中极具智慧的发明之一。其形态如燕子的尾巴，头窄尾宽。从出土文物来看，战国时期的漆器木胎中已出现燕尾榫的应用。到明清时期，燕尾榫工艺达到巅峰，广泛用于家具制作，尤其在苏作家具中更是不可或缺的标志性工艺，被西方木工誉为"中国最精巧的连接方式"。',
      principle: '燕尾榫的榫头呈梯形（鸠尾形），头窄尾宽，与之配合的卯槽亦加工成相应形状。拼接后，榫头在卯槽中无法沿垂直方向拔出，越受拉力咬合越紧，具有天然的自锁功能。传统做法中，榫头与卯槽之间依靠精密的配合角度实现紧密度，通常不施胶即可牢固结合，角度一般在6°至15°之间。',
      applications: ['抽屉侧板与前后板的连接（最典型应用）', '木箱、首饰盒等盒类家具的四角拼接', '柜子侧板与顶底底板的结合', '传统衣箱的角落加固', '古建筑木结构中部分受拉构件的连接']
    },
    params: [
      { key: 'sectionW', name: '木料截面宽', min: 30, max: 150, default: 80, unit: 'mm' },
      { key: 'sectionH', name: '木料截面高', min: 10, max: 60, default: 20, unit: 'mm' },
      { key: 'tenonLength', name: '榫头长度', min: 10, max: 60, default: 25, unit: 'mm' },
      { key: 'tailAngle', name: '燕尾角度', min: 6, max: 15, default: 9, step: 0.5, unit: '°' },
      { key: 'tailCount', name: '燕尾数量', min: 1, max: 5, default: 2, step: 1 },
      { key: 'pinRatio', name: '榫头占比', min: 0.4, max: 0.8, default: 0.6, step: 0.05 }
    ],
    presets: [
      {
        id: 'dovetail-standard',
        name: '标准规格',
        builtIn: true,
        description: '适用于一般抽屉侧板',
        params: { sectionW: 80, sectionH: 20, tenonLength: 25, tailAngle: 9, tailCount: 2, pinRatio: 0.6 }
      },
      {
        id: 'dovetail-heavy',
        name: '加粗型',
        builtIn: true,
        description: '大尺寸抽屉，更多燕尾齿',
        params: { sectionW: 120, sectionH: 30, tenonLength: 35, tailAngle: 8, tailCount: 3, pinRatio: 0.55 }
      },
      {
        id: 'dovetail-fine',
        name: '精巧型',
        builtIn: true,
        description: '首饰盒等精细木工',
        params: { sectionW: 50, sectionH: 12, tenonLength: 15, tailAngle: 11, tailCount: 2, pinRatio: 0.65 }
      }
    ]
  },
  mitered: {
    id: 'mitered',
    name: '粽角榫',
    description: '三根木料直交聚合，形似粽子角，常用于桌柜角部',
    knowledge: {
      history: '粽角榫因其外形酷似粽子的尖角而得名，是中国古典家具中最具代表性的榫卯结构之一。据考证，粽角榫在宋代《营造法式》中已有类似结构的记载，称为"隔角交接"。到明代，随着硬木家具的兴起，粽角榫工艺日臻完善，成为明式家具方角柜、画桌、条案等家具的标志性结构，体现了中国木作"天衣无缝"的美学追求。',
      principle: '粽角榫由三根互相垂直的木料在角部交汇而成，每根木料都同时加工出45°斜角和榫头卯眼，三者咬合交织形成一个完整的直角。三根料各出一部分榫头，又各承接另外两料的榫头，互为阴阳、彼此制约，形成"三料互抱"的结构。这种结构不仅外观整洁美观，更能承受来自三个方向的力，坚固异常。',
      applications: ['方角柜、顶箱柜的四角立柱与顶底框连接', '画桌、条案、餐桌的桌面四角框架', '书柜、博古架的立柱与层板框架连接', '花几、茶几的腿部与面框结合', '传统建筑中木格门窗的角部连接']
    },
    params: [
      { key: 'sectionW', name: '截面宽', min: 30, max: 120, default: 50, unit: 'mm' },
      { key: 'sectionH', name: '截面高', min: 30, max: 120, default: 50, unit: 'mm' },
      { key: 'armLength', name: '悬臂长度', min: 40, max: 200, default: 100, unit: 'mm' },
      { key: 'tenonRatio', name: '榫舌占比', min: 0.3, max: 0.7, default: 0.5, step: 0.05 }
    ],
    presets: [
      {
        id: 'mitered-standard',
        name: '标准规格',
        builtIn: true,
        description: '一般桌柜角部使用',
        params: { sectionW: 50, sectionH: 50, armLength: 100, tenonRatio: 0.5 }
      },
      {
        id: 'mitered-heavy',
        name: '加粗型',
        builtIn: true,
        description: '大型餐桌、书柜立柱',
        params: { sectionW: 80, sectionH: 80, armLength: 150, tenonRatio: 0.45 }
      },
      {
        id: 'mitered-light',
        name: '轻巧型',
        builtIn: true,
        description: '花架、小边几',
        params: { sectionW: 35, sectionH: 35, armLength: 70, tenonRatio: 0.55 }
      }
    ]
  },
  wedge: {
    id: 'wedge',
    name: '楔钉榫',
    description: '弧形木料接合，常用于圈椅扶手等圆形构件',
    knowledge: {
      history: '楔钉榫是专门用于弧形木料拼接的榫卯结构，又称"销钉榫"、"契钉榫"。其起源可追溯至唐代，在出土的唐代木构建筑残件中已见雏形。到宋元时期，随着圈椅、太师椅等弯木家具的流行，楔钉榫得以广泛应用。明代黄成所著《髹饰录》中对楔钉榫工艺有详细记载，是中国木作处理弧形构件的经典智慧。',
      principle: '楔钉榫用于连接两段弧形木料，其结构分为三步：首先在两段木料的对接端分别加工出相互咬合的榫卯（通常为勾头搭掌式），使两段木料初步对接；然后在对接处垂直于木纹方向钻一个贯通的销钉孔；最后将梯形楔钉敲入销钉孔，利用楔钉的胀紧作用将两段弧形料牢牢固定。楔钉呈上窄下宽的梯形，敲入后越敲越紧，永不松动。',
      applications: ['圈椅、皇宫椅的扶手拼接（最典型应用）', '太师椅、官帽椅的靠背弯曲构件', '圆桌、圆凳的圆形边框拼接', '月洞门、圆光罩等建筑装饰构件', '衣架、脸盆架的顶部弯曲横梁']
    },
    params: [
      { key: 'sectionW', name: '截面宽', min: 20, max: 80, default: 35, unit: 'mm' },
      { key: 'sectionH', name: '截面高', min: 20, max: 80, default: 35, unit: 'mm' },
      { key: 'tenonLength', name: '榫头长度', min: 20, max: 80, default: 40, unit: 'mm' },
      { key: 'wedgeWidth', name: '楔钉宽度', min: 6, max: 20, default: 10, unit: 'mm' },
      { key: 'wedgeHeight', name: '楔钉高度', min: 10, max: 40, default: 20, unit: 'mm' }
    ],
    presets: [
      {
        id: 'wedge-standard',
        name: '标准规格',
        builtIn: true,
        description: '一般圈椅扶手',
        params: { sectionW: 35, sectionH: 35, tenonLength: 40, wedgeWidth: 10, wedgeHeight: 20 }
      },
      {
        id: 'wedge-heavy',
        name: '加粗型',
        builtIn: true,
        description: '大尺寸太师椅、皇宫椅',
        params: { sectionW: 55, sectionH: 55, tenonLength: 55, wedgeWidth: 15, wedgeHeight: 28 }
      }
    ]
  },
  shouldered: {
    id: 'shouldered',
    name: '格肩榫',
    description: '横竖材丁字结合，有大格肩、小格肩之分',
    knowledge: {
      history: '格肩榫是中国传统家具中横竖材丁字结合的经典榫卯，又称"掐肩榫"、"大进小出榫"。其历史可追溯至汉代画像石中所见的家具结构。宋代李明仲《营造法式》中详细记载了"隔肩卯口"的做法。至明清时期，格肩榫工艺发展出大格肩、小格肩、飘肩等多种变体，成为桌椅凳类家具横枨与腿足连接的标准做法，是明式家具"结构即装饰"美学的典型体现。',
      principle: '格肩榫用于竖材（腿足）与横材（横枨）的丁字结合。在横材端头做出榫头，榫头上下各削出45°斜肩（格肩）；在竖材相应位置开出卯眼，卯眼上下亦剔出对应的45°凹槽。组装时，横材榫头插入竖材卯眼，同时格肩与竖材凹槽紧密咬合，形成"双肩夹一榫"的结构。格肩的作用是增加接触面积、防止横材扭动，并使结合处外观整洁美观。大格肩榫肩较长，结构更稳固；小格肩则较为精巧。',
      applications: ['桌椅类家具的横枨与腿足连接（最典型应用）', '床架立柱与床挺的丁字结合', '书架、博古架的横撑与立柱连接', '衣柜、顶箱柜的内部横档连接', '条案、画桌的牙条与腿足结合']
    },
    params: [
      { key: 'sectionW', name: '竖材截面宽', min: 30, max: 120, default: 50, unit: 'mm' },
      { key: 'sectionH', name: '竖材截面高', min: 30, max: 120, default: 60, unit: 'mm' },
      { key: 'railW', name: '横材截面宽', min: 30, max: 120, default: 50, unit: 'mm' },
      { key: 'railH', name: '横材截面高', min: 20, max: 80, default: 30, unit: 'mm' },
      { key: 'tenonLength', name: '榫头长度', min: 10, max: 60, default: 25, unit: 'mm' },
      { key: 'shoulderDepth', name: '格肩深度', min: 3, max: 20, default: 8, unit: 'mm' }
    ],
    presets: [
      {
        id: 'shouldered-standard',
        name: '标准规格',
        builtIn: true,
        description: '一般桌椅横枨连接',
        params: { sectionW: 50, sectionH: 60, railW: 50, railH: 30, tenonLength: 25, shoulderDepth: 8 }
      },
      {
        id: 'shouldered-heavy',
        name: '加粗型',
        builtIn: true,
        description: '大型家具承重横枨',
        params: { sectionW: 80, sectionH: 90, railW: 70, railH: 50, tenonLength: 40, shoulderDepth: 12 }
      },
      {
        id: 'shouldered-small',
        name: '小格肩',
        builtIn: true,
        description: '精致家具，格肩较浅',
        params: { sectionW: 40, sectionH: 45, railW: 40, railH: 25, tenonLength: 20, shoulderDepth: 5 }
      }
    ]
  }
}

export const WOOD_TYPES = [
  { id: 'pine', name: '松木', density: 0.45, note: '常用软木，经济实惠' },
  { id: 'fir', name: '杉木', density: 0.40, note: '质轻易加工，耐腐性一般' },
  { id: 'oak', name: '橡木', density: 0.75, note: '硬木，纹理美观，强度高' },
  { id: 'walnut', name: '胡桃木', density: 0.68, note: '高档硬木，色泽深沉' },
  { id: 'cherry', name: '樱桃木', density: 0.63, note: '纹理细腻，色泽温润' },
  { id: 'maple', name: '枫木', density: 0.70, note: '硬度高，纹理清晰' },
  { id: 'birch', name: '桦木', density: 0.65, note: '质地均匀，加工性能好' },
  { id: 'ash', name: '水曲柳', density: 0.68, note: '纹理美观，韧性强' },
  { id: 'teak', name: '柚木', density: 0.65, note: '名贵硬木，耐腐性极强' },
  { id: 'phoenix', name: '红木（花梨）', density: 0.85, note: '传统名贵硬木，密度高' },
  { id: 'sandalwood', name: '紫檀', density: 1.05, note: '顶级名贵木材，密度大于水' },
  { id: 'ebony', name: '乌木', density: 1.10, note: '极致致密，极为珍贵' }
]

export const COMPONENT_COLORS = [
  0xd4a574,
  0x8b5a2b,
  0x5c3a1e,
  0x704214,
  0xa0522d,
  0xcd853f,
  0xb8860b,
  0xcc8833
]

export const INGFA_NAMES = {
  straight: [
    { name: '大边', type: '边挺', position: 'x+' },
    { name: '抹头', type: '抹头', position: 'z-' }
  ],
  dovetail: [
    { name: '屉板旁板', type: '旁板', position: 'z+' },
    { name: '屉板端头', type: '端头板', position: 'x+' }
  ],
  mitered: [
    { name: '腿足', type: '立柱', position: 'y-' },
    { name: '长边', type: '边挺', position: 'x+' },
    { name: '短边', type: '抹头', position: 'z+' }
  ],
  wedge: [
    { name: '扶手左段', type: '弧形构件', position: 'x-' },
    { name: '扶手右段', type: '弧形构件', position: 'x+' },
    { name: '楔钉', type: '销钉', position: 'y+' }
  ],
  shouldered: [
    { name: '腿足', type: '立柱', position: 'y±' },
    { name: '横枨', type: '横撑', position: 'x+' }
  ]
}
