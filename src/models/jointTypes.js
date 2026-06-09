export const JOINT_TYPES = {
  straight: {
    id: 'straight',
    name: '直榫',
    description: '最基础的榫卯形式，榫头呈矩形插入卯口',
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
