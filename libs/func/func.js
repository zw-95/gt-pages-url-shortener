//
(function () {
  /**
   * 增强版 copyRichText，支持 Base64 图片
   * @param {string} content 富文本内容或 Base64 图片
   * @param {Object} options 配置选项 isRawText|是否纯文本；altText|复制图片时的文字内容
   * @returns {Promise<boolean>} 复制是否成功
   */
  async function copyRichText(content, options = {}) {
    const isRawText = options?.isRawText || false;
    try {
      // 判断是否为 Base64 图片
      if (isBase64Image(content)) {
        return await copyBase64ImageAsHTML(content, options.altText || 'Image');
      }

      // 普通富文本处理
      if (navigator.clipboard && window.ClipboardItem) {
        return await copyWithClipboardAPI(content, isRawText);
      }

      return copyWithExecCommand(content, isRawText);
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  }

  /**
   * 判断是否为 Base64 图片
   */
  function isBase64Image(str) {
    // 检查是否为 Base64 图片格式
    const base64ImagePattern = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
    const dataUrlPattern = /^data:image\/[a-zA-Z]+;base64,/;

    return dataUrlPattern.test(str) || (str.length > 50 && base64ImagePattern.test(str));
  }

  /**
   * 将 Base64 图片作为 HTML 复制
   */
  async function copyBase64ImageAsHTML(base64Image, altText) {
    try {
      // 构造完整的 data URL
      const dataUrl = base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`;

      // 创建 HTML 内容
      const htmlContent = `<img src="${dataUrl}" alt="${altText}" />`;
      const plainText = altText;

      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        const textBlob = new Blob([plainText], { type: 'text/plain' });

        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob,
          }),
        ]);

        return true;
      }

      // 回退方法
      return copyWithExecCommand(htmlContent, false);
    } catch (error) {
      console.error('复制图片失败:', error);
      return false;
    }
  }

  /**
   * 使用 Clipboard API 复制
   */
  async function copyWithClipboardAPI(content, isRawText = false) {
    if (isRawText) {
      await navigator.clipboard.writeText(content);
      return true;
    } else {
      const htmlBlob = new Blob([content], { type: 'text/html' });
      const textContent = new DOMParser().parseFromString(content, 'text/html').body.textContent || '';
      const textBlob = new Blob([textContent], { type: 'text/plain' });

      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ]);

      return true;
    }
  }

  /**
   * 使用传统方法复制
   */
  function copyWithExecCommand(content, isRawText = false) {
    let element;
    if (isRawText) {
      // 纯文本，使用 textarea
      element = document.createElement('textarea');
      element.value = content;
      // 为了更好地选中，避免样式干扰
      element.style.position = 'fixed';
      element.style.left = '-9999px';
      element.style.top = '-9999px';
      element.style.opacity = '0';
      // 不需要设置 value 的样式
    } else {
      // 富文本，使用 div
      element = document.createElement('div');
      element.innerHTML = content;
      element.style.position = 'fixed';
      element.style.left = '-9999px';
      element.style.top = '-9999px';
      element.style.opacity = '0';
      // 为了让富文本样式生效，可以设置 contenteditable，但非必须
    }

    document.body.appendChild(element);

    try {
      if (isRawText) {
        // 纯文本：直接选中并复制
        element.select(); // textarea 的方法
        // 对于某些移动端或旧浏览器，可能还需要 element.setSelectionRange(0, element.value.length)
      } else {
        // 富文本：创建 Range 并选中内容
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }

      // 执行复制命令
      const successful = document.execCommand('copy');
      return successful;
    } catch (err) {
      console.error('复制失败:', err);
      return false;
    } finally {
      // 清理
      document.body.removeChild(element);
      // 确保清除选择（尤其是富文本模式下）
      const selection = window.getSelection();
      selection.removeAllRanges();
    }
  }
  // 等待页面加载完成
  function waitForPreCode() {
    const preBlocks = document.querySelectorAll('pre code');
    if (preBlocks.length === 0) {
      // 如果当前没有找到，等待一下再试（适用于异步加载内容，如 SPA）
      setTimeout(waitForPreCode, 500);
      return;
    }

    // 找到所有 <pre><code> 块
    preBlocks.forEach((codeBlock) => {
      const pre = codeBlock.parentElement; // <pre>
      if (!pre) return;

      // 避免重复插入按钮
      if (pre.querySelector('.copy-code-btn')) return;

      // 1. 创建复制按钮
      let btn = document.createElement('button');
      btn.className = 'copy-code-btn';
      btn.title = '点击复制代码';
      btn.innerHTML =
        '<svg t="1756500054955" class="icon icon-small" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="17081" width="1rem" ><path d="M864 128H352a32 32 0 0 0-32 32v160H160a32 32 0 0 0-32 32v512a32 32 0 0 0 32 32h512a32 32 0 0 0 32-32v-160h160a32 32 0 0 0 32-32V160a32 32 0 0 0-32-32z m-224 704H192V384h448v448z m192-192h-128v-288a32 32 0 0 0-32-32h-288V192h448v448z" p-id="17082"></path></svg>';

      // 2. 插入按钮（放在 pre 的最前面，即代码块上方）
      pre.insertBefore(btn, pre.firstChild);

      // 3. 复制功能
      btn.addEventListener('click', function () {
        if (this.disabled) return;
        this.disabled = true;

        // 执行复制
        const codeText = codeBlock.textContent || codeBlock.innerText;
        copyRichText(codeText, { isRawText: true });

        // 改变样式
        var originHTML = this.innerHTML;
        this.innerHTML =
          '<svg t="1756499921384" class="icon icon-small" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16807" width="1rem" ><path d="M918.656 310.656l-512 512a32.032 32.032 0 0 1-45.28 0l-224-224a32 32 0 1 1 45.28-45.28L384 754.72 873.376 265.376a32 32 0 1 1 45.28 45.28z" p-id="16808" fill="#34A853"></path></svg>';
        this.querySelector('svg.icon')?.classList.add('icon-success');
        // 恢复样式
        setTimeout(() => {
          this.innerHTML = originHTML;
          this.querySelector('svg.icon')?.classList.remove('icon-success');
          this.style.color = '';
          this.disabled = false;
        }, 1000);
      });
    });
  }
  // 启动：监听 DOM 加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForPreCode);
  } else {
    waitForPreCode();
  }
  window.copyRichText = copyRichText;
})();
