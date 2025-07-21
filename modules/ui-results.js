/**
 * UI 分析結果渲染模組
 * 處理 SEO 分析結果的顯示和渲染
 */
import { getAssessmentTranslation } from './assessment-translations.js';

export class UIResults {
  constructor() {
    this.currentLanguage = 'zh-TW';
  }

  /**
   * 設定當前語言
   * @param {string} language - 語言代碼 ('zh-TW' 或 'en')
   */
  setLanguage(language) {
    this.currentLanguage = language;
  }

  /**
   * 渲染分析結果
   * @param {Object} analysisResult
   */
  renderAnalysisResults(analysisResult) {
    // 顯示結果容器
    document.getElementById('resultsContainer').classList.add('show');
    
    const issuesList = document.getElementById('issuesList');
    const issues = analysisResult.detailedIssues || [];
    
    // 將問題按評級分組
    const goodIssues = issues.filter(issue => issue.rating === 'good');
    const okIssues = issues.filter(issue => issue.rating === 'ok');
    const badIssues = issues.filter(issue => issue.rating === 'bad');
    
    // 計算分數
    const scores = this.calculateScores(analysisResult, issues);
    
    // 渲染分數卡片
    // const scoresHtml = this.renderScores(scores);
    
    // 渲染摘要資訊
    const summaryHtml = this.renderSummary(goodIssues, okIssues, badIssues, issues);
    
    // 如果只有良好的項目
    if (goodIssues.length > 0 && okIssues.length === 0 && badIssues.length === 0) {
      issuesList.innerHTML = /* scoresHtml + */ summaryHtml + this.renderCelebration() + this.renderGoodIssues(goodIssues);
      return;
    }
    
    // 渲染所有問題
    let allIssuesHtml = '';
    if (badIssues.length > 0) {
      allIssuesHtml += this.renderBadIssues(badIssues);
    }
    if (okIssues.length > 0) {
      allIssuesHtml += this.renderOkIssues(okIssues);
    }
    if (goodIssues.length > 0) {
      allIssuesHtml += this.renderGoodIssues(goodIssues);
    }
    
    issuesList.innerHTML = /* scoresHtml + */ summaryHtml + allIssuesHtml;
  }

  /**
   * 計算分數
   */
  calculateScores(analysisResult, issues) {
    const scores = analysisResult.overallScores || {};
    
    // 如果沒有分數但有詳細問題，計算分數
    if ((!scores.overallScore || scores.overallScore === 0) && issues.length > 0) {
      const totalScore = issues.reduce((sum, issue) => sum + (issue.score || 0), 0);
      const avgScore = Math.round(totalScore / issues.length);
      
      scores.overallScore = avgScore;
      scores.seoScore = Math.round(
        issues.filter(i => i.assessmentType === 'seo')
          .reduce((sum, issue) => sum + (issue.score || 0), 0) / 
        Math.max(1, issues.filter(i => i.assessmentType === 'seo').length)
      );
      scores.readabilityScore = Math.round(
        issues.filter(i => i.assessmentType === 'readability')
          .reduce((sum, issue) => sum + (issue.score || 0), 0) / 
        Math.max(1, issues.filter(i => i.assessmentType === 'readability').length)
      );
    }
    
    return scores;
  }

  /**
   * 渲染分數卡片
   */
  renderScores(scores) {
    const getScoreColor = (score) => {
      if (score >= 80) return 'var(--color-success)';
      if (score >= 60) return 'var(--color-warning)';
      return 'var(--color-error)';
    };

    const getScoreEmoji = (score) => {
      if (score >= 80) return '😊';
      if (score >= 60) return '😐';
      return '😟';
    };

    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: white; border-radius: 8px; padding: 1rem; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 0.5rem 0; color: var(--text-secondary); font-size: 0.9rem;">整體分數</h4>
          <div style="font-size: 2.5rem; font-weight: bold; color: ${getScoreColor(scores.overallScore)}; line-height: 1;">
            ${scores.overallScore || 0}
          </div>
          <div style="font-size: 1.5rem; margin-top: 0.25rem;">${getScoreEmoji(scores.overallScore)}</div>
        </div>
        <div style="background: white; border-radius: 8px; padding: 1rem; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 0.5rem 0; color: var(--text-secondary); font-size: 0.9rem;">SEO 分數</h4>
          <div style="font-size: 2.5rem; font-weight: bold; color: ${getScoreColor(scores.seoScore)}; line-height: 1;">
            ${scores.seoScore || 0}
          </div>
          <div style="font-size: 1.5rem; margin-top: 0.25rem;">${getScoreEmoji(scores.seoScore)}</div>
        </div>
        <div style="background: white; border-radius: 8px; padding: 1rem; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 0.5rem 0; color: var(--text-secondary); font-size: 0.9rem;">可讀性分數</h4>
          <div style="font-size: 2.5rem; font-weight: bold; color: ${getScoreColor(scores.readabilityScore)}; line-height: 1;">
            ${scores.readabilityScore || 0}
          </div>
          <div style="font-size: 1.5rem; margin-top: 0.25rem;">${getScoreEmoji(scores.readabilityScore)}</div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染摘要資訊
   */
  renderSummary(goodIssues, okIssues, badIssues, issues) {
    const actualTotal = issues.length;
    
    return `
      <div style="background: var(--color-gray-light); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
        <h4 style="margin-bottom: 0.5rem;">檢測項目統計 ${actualTotal === 16 ? '(API v2.0 完整檢測)' : ''}</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; font-size: 0.9rem;">
          <div>總檢測項目: ${actualTotal}</div>
          <div style="color: var(--color-success);">✅ 良好: ${goodIssues.length}</div>
          <div style="color: var(--color-warning);">⚠️ 可優化: ${okIssues.length}</div>
          <div style="color: var(--color-error);">❌ 問題: ${badIssues.length}</div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染慶祝訊息
   */
  renderCelebration() {
    return `
      <div style="background: rgba(72, 142, 128, 0.1); border: 2px solid rgba(72, 142, 128, 0.3); 
                  border-radius: 12px; padding: 2rem; text-align: center; margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
        <h3 style="color: var(--color-success); margin-bottom: 0.5rem;">太棒了！</h3>
        <p style="color: var(--text-primary); font-size: 1.1rem;">
          您的網頁通過了所有檢測項目，沒有發現任何需要改進的地方。
        </p>
      </div>
    `;
  }

  /**
   * 渲染良好的項目
   */
  renderGoodIssues(goodIssues) {
    return `
      <div style="margin-bottom: 1.5rem;">
        <h4 style="margin-bottom: 1rem; color: var(--color-success);">✅ 通過的檢測項目 (${goodIssues.length})</h4>
        <div style="display: grid; gap: 0.5rem;">
          ${goodIssues.map(issue => {
            const translated = this.getTranslatedAssessment(issue);
            return `
            <div style="background: rgba(72, 142, 128, 0.05); border: 1px solid rgba(72, 142, 128, 0.2); 
                        border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: var(--color-success); font-size: 1.2rem;">✓</span>
              <div style="flex: 1;">
                <strong style="color: var(--text-primary);">${translated.name}</strong>
                ${translated.description ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${translated.description}</div>` : ''}
              </div>
              <span style="font-size: 0.85rem; color: var(--color-success);">${this.getIssueData(issue)}</span>
            </div>
          `}).join('')}
        </div>
      </div>
    `;
  }

  /**
   * 渲染需要改進的項目
   */
  renderOkIssues(okIssues) {
    return `
      <div style="margin-bottom: 1.5rem;">
        <h4 style="margin-bottom: 1rem; color: var(--color-warning);">⚠️ 可優化項目 (${okIssues.length})</h4>
        <div style="display: grid; gap: 0.5rem;">
          ${okIssues.map(issue => {
            const translated = this.getTranslatedAssessment(issue);
            return `
            <div style="background: rgba(255, 193, 7, 0.05); border: 1px solid rgba(255, 193, 7, 0.2); 
                        border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: var(--color-warning); font-size: 1.2rem;">⚠</span>
              <div style="flex: 1;">
                <strong style="color: var(--text-primary);">${translated.name}</strong>
                ${translated.description ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${translated.description}</div>` : ''}
              </div>
              <span style="font-size: 0.85rem; color: var(--color-warning);">${this.getIssueData(issue)}</span>
            </div>
          `}).join('')}
        </div>
      </div>
    `;
  }

  /**
   * 渲染問題項目
   */
  renderBadIssues(badIssues) {
    return `
      <div style="margin-bottom: 1.5rem;">
        <h4 style="margin-bottom: 1rem; color: var(--color-error);">❌ 存在問題 (${badIssues.length}) - 重要性高</h4>
        <div style="display: grid; gap: 0.5rem;">
          ${badIssues.map(issue => {
            const translated = this.getTranslatedAssessment(issue);
            return `
            <div style="background: rgba(255, 0, 0, 0.05); border: 1px solid rgba(255, 0, 0, 0.2); 
                        border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: var(--color-error); font-size: 1.2rem;">✗</span>
              <div style="flex: 1;">
                <strong style="color: var(--text-primary);">${translated.name}</strong>
                ${translated.description ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${translated.description}</div>` : ''}
              </div>
              <span style="font-size: 0.85rem; color: var(--color-error);">${this.getIssueData(issue)}</span>
            </div>
          `}).join('')}
        </div>
      </div>
    `;
  }

  /**
   * 獲取翻譯後的評估內容
   */
  getTranslatedAssessment(issue) {
    const assessmentId = issue.assessmentId || issue.id;
    
    if (!assessmentId) {
      console.warn('評估項目缺少 ID:', issue);
      return {
        name: issue.name || '未知評估',
        title: issue.title || issue.name || '未知標題',
        description: issue.description || '',
        recommendation: issue.recommendation || ''
      };
    }
    
    const translation = getAssessmentTranslation(assessmentId, issue.rating, this.currentLanguage);
    
    if (translation) {
      return {
        name: translation.name,
        title: translation.title,
        description: translation.description,
        recommendation: translation.recommendation
      };
    }
    
    return {
      name: issue.name || assessmentId,
      title: issue.title || issue.name,
      description: issue.description || '',
      recommendation: issue.recommendation || ''
    };
  }

  /**
   * 獲取問題的實際數據
   */
  getIssueData(issue) {
    let dataStr = '';
    const details = issue.details || {};
    
    // 根據不同的評估 ID 返回相應的數據
    switch(issue.id || issue.assessmentId) {
      case 'H1_MISSING':
        dataStr = `H1: ${details.count || details.h1Count || 0} 個`;
        break;
      case 'MULTIPLE_H1':
        dataStr = `H1: ${details.count || details.h1Count || 2} 個`;
        break;
      case 'H1_KEYWORD_MISSING':
        dataStr = details.h1Text ? `"${details.h1Text.substring(0, 30)}..."` : '無 H1';
        break;
      case 'IMAGES_MISSING_ALT':
        const total = details.totalImages || details.imageCount || 0;
        const missing = details.missingAltCount || details.imagesWithoutAlt || 0;
        dataStr = `${missing}/${total} 張缺少`;
        break;
      case 'KEYWORD_MISSING_FIRST_PARAGRAPH':
        dataStr = details.firstParagraph ? 
          `"${details.firstParagraph.substring(0, 50)}..."` : 
          `關鍵字: ${details.keywordCount || 0} 次`;
        break;
      case 'KEYWORD_DENSITY_LOW':
        const densityValue = parseFloat(details.density || details.keywordDensity || '0');
        const density = densityValue.toFixed(2);
        const keywordCount = details.keywordCount || 0;
        const totalWords = details.totalWords || details.wordCount || 0;
        dataStr = `${density}% (${keywordCount}/${totalWords} 字)`;
        break;
      case 'META_DESCRIPTION_MISSING':
      case 'META_DESCRIPTION_NEEDS_IMPROVEMENT':
        const metaDesc = details.metaDescription || details.description || '';
        if (details.pixelWidth !== undefined) {
          dataStr = `${details.pixelWidth}px (約${details.charEquivalent || 0}字)`;
        } else {
          const metaLength = details.length || metaDesc.length || 0;
          dataStr = `${metaLength} 字`;
        }
        if (metaDesc && metaDesc.length > 0) {
          dataStr += `: "${metaDesc.substring(0, 30)}..."`;
        }
        break;
      case 'TITLE_MISSING':
      case 'TITLE_NEEDS_IMPROVEMENT':
        const title = details.title || '';
        if (details.pixelWidth !== undefined) {
          dataStr = `${details.pixelWidth}px (約${details.charEquivalent || 0}字)`;
        } else {
          const titleLength = details.length || title.length || 0;
          dataStr = `${titleLength} 字`;
        }
        if (title) {
          dataStr += `: "${title.substring(0, 30)}..."`;
        }
        break;
      case 'CONTENT_LENGTH_SHORT':
        dataStr = `${details.wordCount || 0} 字`;
        break;
      case 'FLESCH_READING_EASE':
        dataStr = `分數: ${details.score || 0}`;
        break;
      case 'PARAGRAPH_LENGTH_LONG':
        dataStr = `${details.longParagraphs || 0} 個過長`;
        break;
      case 'SENTENCE_LENGTH_LONG':
        dataStr = `${details.percentage || 0}% 過長`;
        break;
      case 'SUBHEADING_DISTRIBUTION_POOR':
        dataStr = `${details.longTextBlocks || 0} 區塊過長`;
        break;
      default:
        if (details.count !== undefined) {
          dataStr = `數量: ${details.count}`;
        }
    }
    
    return dataStr;
  }
}