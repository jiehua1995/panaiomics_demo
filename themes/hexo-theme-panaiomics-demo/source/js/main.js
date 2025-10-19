function reportApp() {
  return {
    expandedItems: {},
    expandedMedItems: {},

    // 生成条码和二维码
    generateBarcodes(reportId) {
      // 生成一维码
      if (typeof JsBarcode !== 'undefined') {
        const barcodeElement = document.getElementById('barcode');
        if (barcodeElement) {
          JsBarcode("#barcode", reportId, {
            format: "CODE128",
            lineColor: "#000",
            width: 1.5,
            height: 40,
            displayValue: false
          });
        }
      }

      // 生成报告二维码
      if (typeof QRCode !== 'undefined') {
        const qrUrl = window.location.href;
        const qrElement = document.getElementById('qrcode');
        if (qrElement) {
          QRCode.toCanvas(qrElement, qrUrl, {
            width: 80,
            margin: 1,
            color: {
              dark: "#000000",
              light: "#ffffff"
            }
          }, function(error) {
            if (error) console.error(error);
          });
        }
      }
    },

    // 切换详情显示状态
    toggleDetails(id) {
      this.expandedItems[id] = !this.expandedItems[id];
    },

    // 切换药物详情显示状态
    toggleMedDetails(id) {
      this.expandedMedItems[id] = !this.expandedMedItems[id];
    },

    // 检查疾病是否展开
    isExpanded(id) {
      return this.expandedItems[id] || false;
    },

    // 检查药物是否展开
    isExpandedMed(id) {
      return this.expandedMedItems[id] || false;
    },

    // 获取基因组易感性分类
    getGenomicSusceptibility(score) {
      if (score < 0.2) return "极不易感";
      if (score >= 0.2 && score < 0.4) return "不易感";
      if (score >= 0.4 && score < 0.6) return "人群平均水平";
      if (score >= 0.6 && score < 0.8) return "易感";
      return "高度易感";
    },

    // 获取蛋白质组风险分类
    getProteomicRisk(score) {
      if (score < 0.2) return "低风险";
      if (score >= 0.2 && score < 0.4) return "中低风险";
      if (score >= 0.4 && score < 0.6) return "人群平均水平";
      if (score >= 0.6 && score < 0.8) return "中高风险";
      return "高风险";
    },

    // 显示风险级别提示
    showRiskLevelTooltip(riskType, score) {
      let title, description;

      if (riskType === 'genomic') {
        title = this.getGenomicSusceptibility(score);
        if (score < 0.2) {
          description = "基因组分析显示您相对于普通人群极不易患此疾病。不过，生活方式和环境因素仍可能影响发病风险。";
        } else if (score >= 0.2 && score < 0.4) {
          description = "基因组分析显示您相对于普通人群不易患此疾病。建议保持健康的生活方式。";
        } else if (score >= 0.4 && score < 0.6) {
          description = "基因组分析显示您患此疾病的风险处于人群平均水平，建议关注相关预防措施。";
        } else if (score >= 0.6 && score < 0.8) {
          description = "基因组分析显示您患此疾病的风险高于人群平均水平，建议严格遵循预防建议。";
        } else {
          description = "基因组分析显示您患此疾病的风险显著高于人群平均水平，建议严格遵循预防建议并进行定期筛查。";
        }
      } else {
        title = this.getProteomicRisk(score);
        if (score < 0.2) {
          description = "蛋白质组分析显示您目前的生物标志物处于极佳健康范围内，继续保持健康的生活方式。";
        } else if (score >= 0.2 && score < 0.4) {
          description = "蛋白质组分析显示您目前的生物标志物处于健康范围内，继续保持良好习惯。";
        } else if (score >= 0.4 && score < 0.6) {
          description = "蛋白质组分析显示相关标志物处于一般水平，建议保持健康生活方式。";
        } else if (score >= 0.6 && score < 0.8) {
          description = "蛋白质组分析显示一些相关标志物异常，建议密切关注并采取生活方式干预。";
        } else {
          description = "蛋白质组分析显示多个相关标志物明显异常，建议尽快咨询医生并进行进一步检查。";
        }
      }

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: title,
          html: description,
          icon: score < 0.3 ? 'success' : (score >= 0.7 ? 'warning' : 'info'),
          confirmButtonText: '了解了',
          confirmButtonColor: '#3498db'
        });
      } else {
        alert(title + '\n\n' + description);
      }
    },

    // 显示基因信息弹窗
    showGeneInfo(gene) {
      const geneName = gene.name;
      const variant = gene.variant;

      // 使用SweetAlert2显示美观的基因信息弹窗
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: `基因：${geneName}`,
          html: `变异：${variant}`,
          icon: 'info',
          confirmButtonText: '关闭'
        });
      } else {
        alert(`基因：${geneName}\n变异：${variant}`);
      }
    },

    // 显示疾病风险信息
    displayDiseaseRisk(genomicScore, proteomicScore) {
      const genomicRisk = this.getGenomicSusceptibility(genomicScore);
      const proteomicRisk = this.getProteomicRisk(proteomicScore);

      return {
        genomicRisk,
        proteomicRisk
      };
    },
  };
}

// 初始化进度条动画
document.addEventListener('DOMContentLoaded', function() {
  console.log('PanAiOmics 健康报告已加载');
  
  // 生成条码和二维码
  generateBarcodes();

  // 初始化进度条动画
  setTimeout(() => {
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
      const targetWidth = bar.style.width || bar.getAttribute('data-width') || '0%';
      bar.style.width = '0%';
      
      setTimeout(() => {
        bar.style.transition = 'width 1.5s ease-in-out';
        bar.style.width = targetWidth;
      }, 300);
    });
  }, 500);
  
  // 初始化折叠按钮事件监听 - 延迟执行确保DOM完全加载
  setTimeout(() => {
    initializeCollapseButtons();
  }, 100);
});

// 生成条码和二维码
function generateBarcodes() {
  const reportIdElement = document.getElementById('report-id');
  const reportId = reportIdElement ? reportIdElement.textContent.trim() : 'RPT2025080001';

  // Helper function to generate barcode
  const generateBarcode = (elementId, data) => {
    const element = document.getElementById(elementId);
    if (element && typeof JsBarcode !== 'undefined') {
      try {
        JsBarcode(element, data, {
          format: "CODE128",
          lineColor: "#000",
          width: 1.5,
          height: 40,
          displayValue: false
        });
        console.log('条形码生成成功:', data);
      } catch (e) {
        console.warn('条码生成失败:', e);
      }
    }
  };

  // Helper function to generate QR code
  const generateQRCode = (elementId, url) => {
    const element = document.getElementById(elementId);
    if (element && typeof QRCode !== 'undefined') {
      element.innerHTML = '';
      try {
        const canvas = document.createElement('canvas');
        element.appendChild(canvas);
        QRCode.toCanvas(canvas, url, {
          width: 80,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff"
          }
        }, function(error) {
          if (error) console.warn('二维码生成失败:', error);
        });
      } catch (e) {
        console.warn('二维码生成失败:', e);
      }
    }
  };

  // Generate barcode and QR code
  generateBarcode('barcode', reportId);
  generateQRCode('qrcode', window.location.href);
}

function initializeCollapseButtons() {
  // 处理疾病风险评估部分的折叠按钮
  const riskCollapseButtons = document.querySelectorAll('#risk-assessment-section [data-bs-toggle="collapse"]');
  
  riskCollapseButtons.forEach(function(button) {
    const targetId = button.getAttribute('data-bs-target');
    const collapseElement = document.querySelector(targetId);
    const icon = button.querySelector('i.fa-chevron-down, i.fa-chevron-up');
    const card = button.closest('.card');
    const summaryElement = card ? card.querySelector('[class*="collapse-summary-"]') : null;

    console.log('Processing button:', button);
    console.log('Target ID:', targetId);
    console.log('Collapse element:', collapseElement);
    console.log('Summary element:', summaryElement);

    if (collapseElement) {
      // 初始化状态 - 默认显示摘要，隐藏详情
      if (collapseElement.classList.contains('show')) {
        if (icon) {
          icon.classList.remove('fa-chevron-down');
          icon.classList.add('fa-chevron-up');
        }
        if (summaryElement) {
          summaryElement.style.display = 'none';
        }
      } else {
        if (icon) {
          icon.classList.remove('fa-chevron-up');
          icon.classList.add('fa-chevron-down');
        }
        if (summaryElement) {
          summaryElement.style.display = 'block';
        }
      }

      // 展开时隐藏摘要信息
      collapseElement.addEventListener('show.bs.collapse', function() {
        console.log('Showing collapse element:', targetId);
        if (icon) {
          icon.classList.remove('fa-chevron-down');
          icon.classList.add('fa-chevron-up');
        }
        if (summaryElement) {
          summaryElement.style.display = 'none';
          console.log('Hiding summary element');
        }
      });

      // 收起时显示摘要信息
      collapseElement.addEventListener('hide.bs.collapse', function() {
        console.log('Hiding collapse element:', targetId);
        if (icon) {
          icon.classList.remove('fa-chevron-up');
          icon.classList.add('fa-chevron-down');
        }
        if (summaryElement) {
          summaryElement.style.display = 'block';
          console.log('Showing summary element');
        }
      });
    }
  });

  // 处理其他折叠按钮（药物部分等）
  const otherCollapseButtons = document.querySelectorAll('[data-bs-toggle="collapse"]:not(.report-section#risk-assessment-section [data-bs-toggle="collapse"])');
  
  otherCollapseButtons.forEach(function(button) {
    const targetId = button.getAttribute('data-bs-target');
    const collapseElement = document.querySelector(targetId);
    const icon = button.querySelector('i.fa-chevron-down, i.fa-chevron-up');

    if (collapseElement && icon) {
      // 初始化箭头方向
      if (collapseElement.classList.contains('show')) {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
      } else {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
      }

      // 展开时将箭头向上
      collapseElement.addEventListener('show.bs.collapse', function() {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
      });

      // 收起时将箭头向下
      collapseElement.addEventListener('hide.bs.collapse', function() {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
      });
    }
  });
}