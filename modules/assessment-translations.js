// PageLens 評估項目翻譯映射
// 用於前端根據 API 返回的評估 ID 顯示對應語言的內容

const assessmentTranslations = {
  // ========== SEO 評估項目 (12個) ==========

  H1_MISSING: {
    'zh-TW': {
      name: 'H1 標籤檢測',
      good: {
        title: 'H1 標籤正常',
        description: '頁面有 H1 標題',
        recommendation: '太好了！你的頁面有 H1 標題。'
      },
      bad: {
        title: '缺少 H1 標籤',
        description: '頁面缺少 H1 標題',
        recommendation: '新增一個 H1 標題來描述頁面的主要內容。'
      }
    },
    en: {
      name: 'H1 Tag Check',
      good: {
        title: 'H1 Tag Present',
        description: 'Page has an H1 heading',
        recommendation: 'Great! Your page has an H1 heading.'
      },
      bad: {
        title: 'H1 Tag Missing',
        description: 'Page is missing an H1 heading',
        recommendation:
          'Add exactly one H1 heading that describes the main topic of your page.'
      }
    }
  },

  MULTIPLE_H1: {
    'zh-TW': {
      name: '多重 H1 檢測',
      good: {
        title: '單一 H1 標籤',
        description: '頁面只有一個 H1 標題',
        recommendation: '完美！你的頁面只有一個 H1 標題。'
      },
      bad: {
        title: '多個 H1 標籤',
        description: '頁面有多個 H1 標題',
        recommendation: '每頁只使用一個 H1 標籤。將其他的 H1 改為 H2 或 H3。'
      }
    },
    en: {
      name: 'Multiple H1 Detection',
      good: {
        title: 'Single H1 Tag',
        description: 'Page has exactly one H1 heading',
        recommendation: 'Perfect! Your page has exactly one H1 heading.'
      },
      bad: {
        title: 'Multiple H1 Tags',
        description: 'Page has multiple H1 headings',
        recommendation:
          'Use only one H1 heading per page. Convert additional H1s to H2 or H3.'
      }
    }
  },

  H1_KEYWORD_MISSING: {
    'zh-TW': {
      name: 'H1 關鍵字檢測',
      good: {
        title: 'H1 包含關鍵字',
        description: 'H1 標題包含焦點關鍵字和相關關鍵字',
        recommendation: '完美！你的 H1 同時包含了焦點關鍵字和相關關鍵字。'
      },
      ok: {
        title: '沒有提供焦點關鍵字',
        description: '沒有提供焦點關鍵字進行 H1 分析',
        recommendation: '設定焦點關鍵字以分析 H1 優化。'
      },
      bad: {
        title: 'H1 缺少關鍵字',
        description: 'H1 標題缺少焦點關鍵字',
        recommendation: '在 H1 標題中加入焦點關鍵字和至少一個相關關鍵字。'
      }
    },
    en: {
      name: 'H1 Keyword Check',
      good: {
        title: 'H1 Contains Keywords',
        description: 'H1 heading contains focus keyword and related keywords',
        recommendation:
          'Perfect! Your H1 contains both the focus keyword and related keywords.'
      },
      ok: {
        title: 'H1 Contains Focus Keyword',
        description: 'H1 heading contains the focus keyword',
        recommendation: 'Good! H1 contains the focus keyword.'
      },
      bad: {
        title: 'H1 Missing Keywords',
        description: 'H1 heading missing focus keyword',
        recommendation:
          'Include your focus keyword and at least one related keyword in the H1 heading.'
      }
    }
  },

  H2_SYNONYMS_MISSING: {
    'zh-TW': {
      name: 'H2 相關關鍵字檢測',
      good: {
        title: '所有相關關鍵字都在 H2 中',
        description: '所有相關關鍵字都出現在 H2 標題中',
        recommendation: '太棒了！所有相關關鍵字都分布在 H2 標題中。'
      },
      ok: {
        title: '沒有提供相關關鍵字',
        description: '沒有提供相關關鍵字進行 H2 分析',
        recommendation: '設定相關關鍵字以分析 H2 優化。'
      },
      bad: {
        title: '大部分相關關鍵字缺失',
        description: 'H2 標題中缺少大部分相關關鍵字',
        recommendation: '在 H2 標題中加入相關關鍵字，改善內容結構。'
      }
    },
    en: {
      name: 'H2 Related Keywords Check',
      good: {
        title: 'All Related Keywords in H2',
        description: 'All related keywords appear in H2 headings',
        recommendation:
          'Excellent! All your related keywords appear in H2 headings.'
      },
      ok: {
        title: 'Related Keywords Check Skipped',
        description: 'No related keywords provided for H2 analysis',
        recommendation: 'Provide related keywords to analyze H2 optimization.'
      },
      bad: {
        title: 'Most Related Keywords Missing',
        description: 'Most related keywords missing from H2',
        recommendation: 'Include related keywords in your H2 headings.'
      }
    }
  },

  IMAGES_MISSING_ALT: {
    'zh-TW': {
      name: '圖片替代文字檢測',
      good: {
        title: '所有圖片都有替代文字',
        description: '所有圖片都有描述性的 alt 屬性',
        recommendation: '太好了！所有圖片都有替代文字。'
      },
      bad: {
        title: '圖片缺少替代文字',
        description: '部分圖片缺少 alt 屬性',
        recommendation: '為所有圖片加入描述性的替代文字，改善無障礙性和 SEO。'
      }
    },
    en: {
      name: 'Image Alt Text Check',
      good: {
        title: 'All Images Have Alt Text',
        description: 'All images have descriptive alt text',
        recommendation: 'Excellent! All your images have alt text.'
      },
      bad: {
        title: 'Images Missing Alt Text',
        description: 'Some images are missing alt text',
        recommendation:
          'Add descriptive alt text to all images for better accessibility and SEO.'
      }
    }
  },

  KEYWORD_MISSING_FIRST_PARAGRAPH: {
    'zh-TW': {
      name: '首段關鍵字檢測',
      good: {
        title: '關鍵字出現在首段',
        description: '焦點關鍵字出現在第一段',
        recommendation: '很好！你的焦點關鍵字出現在第一段。'
      },
      ok: {
        title: '沒有提供焦點關鍵字',
        description: '沒有提供焦點關鍵字進行首段分析',
        recommendation: '設定焦點關鍵字以分析首段優化。'
      },
      bad: {
        title: '首段缺少關鍵字',
        description: '焦點關鍵字沒有出現在第一段',
        recommendation: '在第一段中加入焦點關鍵字以提升 SEO 效果。'
      }
    },
    en: {
      name: 'First Paragraph Keyword Check',
      good: {
        title: 'Keyword in First Paragraph',
        description: 'Focus keyword appears in the first paragraph',
        recommendation:
          'Great! Your focus keyword appears in the first paragraph.'
      },
      bad: {
        title: 'Keyword Missing from First Paragraph',
        description: 'Focus keyword does not appear in the first paragraph',
        recommendation:
          'Include your focus keyword in the first paragraph to improve SEO.'
      }
    }
  },

  KEYWORD_DENSITY_LOW: {
    'zh-TW': {
      name: '關鍵字密度檢測',
      good: {
        title: '關鍵字密度適中',
        description: '關鍵字密度在最佳範圍內',
        recommendation: '完美！你的關鍵字密度在最佳範圍內。'
      },
      ok: {
        title: '沒有提供焦點關鍵字',
        description: '沒有提供焦點關鍵字進行密度分析',
        recommendation: '設定焦點關鍵字以分析關鍵字密度。'
      },
      bad: {
        title: '關鍵字密度異常',
        description: '關鍵字密度過低或過高',
        recommendation:
          '調整關鍵字使用頻率，建議密度保持在 0.5-6.0% 之間（最佳範圍：0.5-2.5%）。'
      }
    },
    en: {
      name: 'Keyword Density Check',
      good: {
        title: 'Good Keyword Density',
        description: 'Keyword density is within optimal range',
        recommendation:
          'Perfect! Your keyword density is within the optimal range.'
      },
      bad: {
        title: 'Keyword Density Issue',
        description: 'Keyword density is too low or too high',
        recommendation:
          'Adjust keyword usage. Recommended density: 0.5-2.5%. Keywords in H2 headings have 2x weight.'
      }
    }
  },

  META_DESCRIPTION_NEEDS_IMPROVEMENT: {
    'zh-TW': {
      name: 'Meta 描述關鍵字檢測',
      good: {
        title: 'Meta 描述包含關鍵字',
        description: 'Meta 描述包含焦點關鍵字',
        recommendation: '很好！你的 Meta 描述包含了焦點關鍵字。'
      },
      ok: {
        title: '沒有提供焦點關鍵字',
        description: '沒有提供焦點關鍵字進行 Meta 描述分析',
        recommendation: '設定焦點關鍵字以分析 Meta 描述優化。'
      },
      bad: {
        title: 'Meta 描述需要改進',
        description: 'Meta 描述缺少焦點關鍵字',
        recommendation: '在 Meta 描述中加入焦點關鍵字。'
      }
    },
    en: {
      name: 'Meta Description Keyword Check',
      good: {
        title: 'Meta Description Contains Keyword',
        description: 'Meta description contains the focus keyword',
        recommendation:
          'Great! Your meta description contains the focus keyword.'
      },
      bad: {
        title: 'Meta Description Needs Improvement',
        description: 'Meta description missing focus keyword',
        recommendation: 'Include your focus keyword in the meta description.'
      }
    }
  },

  META_DESCRIPTION_MISSING: {
    'zh-TW': {
      name: 'Meta 描述長度檢測',
      good: {
        title: 'Meta 描述長度適中',
        description: 'Meta 描述寬度在最佳範圍內',
        recommendation: '完美！你的 Meta 描述長度適中。'
      },
      ok: {
        title: 'Meta 描述過短',
        description: 'Meta 描述長度不足',
        recommendation: '擴充 Meta 描述內容，建議寬度 >600px。'
      },
      bad: {
        title: 'Meta 描述問題',
        description: 'Meta 描述缺失或過長',
        recommendation: '調整 Meta 描述（最佳寬度：600-960px）。',
        // 以下為細分情況，前端可根據 details 判斷
        missing: {
          title: '缺少 Meta 描述',
          description: '頁面缺少 Meta 描述',
          recommendation: '新增 Meta 描述（最佳寬度：600-960px）。'
        },
        tooLong: {
          title: 'Meta 描述過長',
          description: 'Meta 描述超過建議長度',
          recommendation: '縮短 Meta 描述至 960px 以內。'
        }
      }
    },
    en: {
      name: 'Meta Description Length Check',
      good: {
        title: 'Meta Description Length Good',
        description: 'Meta description width is optimal',
        recommendation: 'Perfect! Your meta description width is optimal.'
      },
      ok: {
        title: 'Meta Description Too Short',
        description: 'Meta description is too short',
        recommendation: 'Expand meta description. Optimal: >600px.'
      },
      bad: {
        title: 'Meta Description Issue',
        description: 'Meta description missing or too long',
        recommendation: 'Adjust meta description (optimal: 600-960px).',
        // Subcategories for frontend to determine based on details
        missing: {
          title: 'Meta Description Missing',
          description: 'Page is missing meta description',
          recommendation: 'Add a meta description (optimal: 600-960px).'
        },
        tooLong: {
          title: 'Meta Description Too Long',
          description: 'Meta description exceeds recommended length',
          recommendation: 'Shorten meta description to under 960px.'
        }
      }
    }
  },

  TITLE_NEEDS_IMPROVEMENT: {
    'zh-TW': {
      name: '標題長度檢測',
      good: {
        title: '標題長度適中',
        description: '標題寬度在最佳範圍內',
        recommendation: '完美！你的標題長度適中。'
      },
      ok: {
        title: '標題長度需調整',
        description: '標題過短或過長',
        recommendation: '調整標題長度，建議寬度 >150px，最大 600px。'
      },
      bad: {
        title: '缺少標題',
        description: '頁面缺少標題',
        recommendation: '新增描述性標題（最佳寬度：>150px，最大 600px）。'
      }
    },
    en: {
      name: 'Title Length Check',
      good: {
        title: 'Title Length Good',
        description: 'Title width is optimal',
        recommendation: 'Perfect! Your title width is optimal.'
      },
      ok: {
        title: 'Title Length Needs Improvement',
        description: 'Title too short or too long',
        recommendation: 'Adjust title length. Optimal: >150px, max 600px.'
      },
      bad: {
        title: 'Title Missing',
        description: 'Page is missing title',
        recommendation:
          'Add a descriptive title (optimal width: >150px, max 600px).'
      }
    }
  },

  TITLE_MISSING: {
    'zh-TW': {
      name: '標題關鍵字檢測',
      good: {
        title: '標題包含關鍵字',
        description: '標題包含焦點關鍵字和相關關鍵字',
        recommendation: '完美！你的標題同時包含了焦點關鍵字和相關關鍵字。'
      },
      ok: {
        title: '沒有提供焦點關鍵字',
        description: '沒有提供焦點關鍵字進行標題分析',
        recommendation: '設定焦點關鍵字以分析標題優化。'
      },
      bad: {
        title: '標題缺少關鍵字',
        description: '標題缺少焦點關鍵字',
        recommendation: '在標題中加入焦點關鍵字和至少一個相關關鍵字。'
      }
    },
    en: {
      name: 'Title Keyword Check',
      good: {
        title: 'Title Contains Keywords',
        description: 'Title contains focus keyword and related keywords',
        recommendation:
          'Perfect! Your title contains both the focus keyword and related keywords.'
      },
      ok: {
        title: 'Title Contains Focus Keyword',
        description: 'Title contains the focus keyword',
        recommendation: 'Good! Title contains the focus keyword.'
      },
      bad: {
        title: 'Title Missing Keywords',
        description: 'Title missing focus keyword',
        recommendation:
          'Include your focus keyword and at least one related keyword in the title.'
      }
    }
  },

  CONTENT_LENGTH_SHORT: {
    'zh-TW': {
      name: '內容長度檢測',
      good: {
        title: '內容長度充足',
        description: '內容字數達到最低要求',
        recommendation: '很好！你的內容達到了最低字數要求。'
      },
      bad: {
        title: '內容過短',
        description: '內容字數不足',
        recommendation: '擴充內容至少到 300 字以上。'
      }
    },
    en: {
      name: 'Content Length Check',
      good: {
        title: 'Content Length Good',
        description: 'Content meets minimum word count',
        recommendation: 'Great! Your content meets the minimum word count.'
      },
      bad: {
        title: 'Content Too Short',
        description: 'Content has insufficient words',
        recommendation: 'Consider expanding your content to at least 300 words.'
      }
    }
  },

  // ========== 可讀性評估項目 (4個) ==========

  FLESCH_READING_EASE: {
    'zh-TW': {
      name: '可讀性評分',
      good: {
        title: '可讀性良好',
        description: '文章易於閱讀',
        recommendation: '太好了！你的文章易於理解。'
      },
      ok: {
        title: '可讀性尚可',
        description: '文章可讀性一般',
        recommendation: '考慮簡化句子結構，使文章更易讀。'
      },
      bad: {
        title: '可讀性較差',
        description: '文章較難閱讀',
        recommendation: '使用更簡短的句子和常用詞彙來提升可讀性。'
      }
    },
    en: {
      name: 'Readability Score',
      good: {
        title: 'Good Readability',
        description: 'Text is easy to read',
        recommendation: 'Great! Your text is easy to understand.'
      },
      ok: {
        title: 'Fair Readability',
        description: 'Text readability is average',
        recommendation:
          'Consider simplifying sentence structure for better readability.'
      },
      bad: {
        title: 'Poor Readability',
        description: 'Text is difficult to read',
        recommendation:
          'Use shorter sentences and common words to improve readability.'
      }
    }
  },

  PARAGRAPH_LENGTH_LONG: {
    'zh-TW': {
      name: '段落長度檢測',
      good: {
        title: '段落長度適中',
        description: '所有段落長度都在建議範圍內',
        recommendation: '很好！你的段落長度適合閱讀。'
      },
      bad: {
        title: '段落過長',
        description: '部分段落超過建議長度',
        recommendation: '將過長的段落分成較短的段落，每段建議不超過 150 字。'
      }
    },
    en: {
      name: 'Paragraph Length Check',
      good: {
        title: 'Good Paragraph Length',
        description: 'All paragraphs are within recommended length',
        recommendation: 'Great! Your paragraph lengths are reader-friendly.'
      },
      bad: {
        title: 'Long Paragraphs',
        description: 'Some paragraphs exceed recommended length',
        recommendation:
          'Break long paragraphs into shorter ones. Aim for max 150 words per paragraph.'
      }
    }
  },

  SENTENCE_LENGTH_LONG: {
    'zh-TW': {
      name: '句子長度檢測',
      good: {
        title: '句子長度適中',
        description: '大部分句子長度都在建議範圍內',
        recommendation: '太棒了！你的句子長度適合閱讀。'
      },
      bad: {
        title: '句子過長',
        description: '過多句子超過建議長度',
        recommendation: '縮短過長的句子，每句建議不超過 20 個字。'
      }
    },
    en: {
      name: 'Sentence Length Check',
      good: {
        title: 'Good Sentence Length',
        description: 'Most sentences are within recommended length',
        recommendation: 'Excellent! Your sentence lengths are reader-friendly.'
      },
      bad: {
        title: 'Long Sentences',
        description: 'Too many sentences exceed recommended length',
        recommendation:
          'Shorten long sentences. Aim for max 20 words per sentence.'
      }
    }
  },

  SUBHEADING_DISTRIBUTION_POOR: {
    'zh-TW': {
      name: '子標題分布檢測',
      good: {
        title: '子標題分布良好',
        description: '子標題分布合理',
        recommendation: '很好！你的內容結構清晰。'
      },
      bad: {
        title: '子標題分布不佳',
        description: '文字區塊過長，缺少子標題',
        recommendation:
          '增加子標題來改善內容結構，建議每 300 字至少一個子標題。'
      }
    },
    en: {
      name: 'Subheading Distribution Check',
      good: {
        title: 'Good Subheading Distribution',
        description: 'Subheadings are well distributed',
        recommendation: 'Great! Your content structure is clear.'
      },
      bad: {
        title: 'Poor Subheading Distribution',
        description: 'Text blocks too long without subheadings',
        recommendation:
          'Add subheadings to improve structure. Aim for at least one subheading per 300 words.'
      }
    }
  }
};

// 輔助函數：根據評估結果獲取對應的翻譯
function getAssessmentTranslation(
  assessmentId,
  status,
  language = 'zh-TW',
  details = {}
) {
  const assessment = assessmentTranslations[assessmentId];
  if (!assessment || !assessment[language]) {
    console.warn(`Translation not found for ${assessmentId} in ${language}`);
    return null;
  }

  const lang = assessment[language];
  const statusKey = status.toLowerCase(); // good, ok, bad

  // 特殊處理 META_DESCRIPTION_MISSING 的 bad 狀態
  if (assessmentId === 'META_DESCRIPTION_MISSING' && statusKey === 'bad') {
    // 根據 pixelWidth 判斷是缺失還是過長
    if (details.pixelWidth === 0) {
      return {
        name: lang.name,
        title: lang.bad.missing?.title || lang.bad.title,
        description: lang.bad.missing?.description || lang.bad.description,
        recommendation:
          lang.bad.missing?.recommendation || lang.bad.recommendation
      };
    } else if (details.pixelWidth > 960) {
      return {
        name: lang.name,
        title: lang.bad.tooLong?.title || lang.bad.title,
        description: lang.bad.tooLong?.description || lang.bad.description,
        recommendation:
          lang.bad.tooLong?.recommendation || lang.bad.recommendation
      };
    }
  }

  return {
    name: lang.name,
    title: lang[statusKey]?.title || lang.bad.title,
    description: lang[statusKey]?.description || lang.bad.description,
    recommendation: lang[statusKey]?.recommendation || lang.bad.recommendation
  };
}

// 評估影響級別翻譯
const impactTranslations = {
  high: { 'zh-TW': '高', en: 'High' },
  medium: { 'zh-TW': '中', en: 'Medium' },
  low: { 'zh-TW': '低', en: 'Low' }
};

// 評估類型翻譯
const typeTranslations = {
  SEO: { 'zh-TW': 'SEO', en: 'SEO' },
  READABILITY: { 'zh-TW': '可讀性', en: 'Readability' }
};

// 導出給前端使用
export {
  assessmentTranslations,
  getAssessmentTranslation,
  impactTranslations,
  typeTranslations
};
