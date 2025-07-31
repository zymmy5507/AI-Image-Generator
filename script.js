
    // Example prompts and DOM references
    const examplePrompts = [
      "A magic forest with glowing plants and fairy homes among giant mushrooms",
      "An old steampunk airship floating through golden clouds at sunset",
      "A futuristic city skyline at night, neon lights reflecting on wet streets",
      "A cute robot painting a landscape on a canvas in a sunny field",
      "A majestic lion with a mane made of galaxies and stars"
    ];
    const themeToggle = document.getElementById('themeToggle');
    const promptForm = document.getElementById('promptForm');
    const promptInput = document.getElementById('promptInput');
    const randomPromptBtn = document.getElementById('randomPromptBtn');
    const modelSelect = document.getElementById('modelSelect');
    const imageCountSelect = document.getElementById('imageCountSelect');
    const aspectRatioSelect = document.getElementById('aspectRatioSelect');
    const generateBtn = document.getElementById('generateBtn');
    const galleryGrid = document.getElementById('galleryGrid');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      themeToggle.innerHTML = `<i class="fa-solid fa-${isDark ? 'sun' : 'moon'}"></i>`;
      localStorage.setItem('darkTheme', isDark);
    });
    if (localStorage.getItem('darkTheme') === 'true') {
      document.body.classList.add('dark-theme');
      themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
    randomPromptBtn.addEventListener('click', () => {
      const randomPrompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
      promptInput.value = randomPrompt;
    });
    function showMessage(message, type = 'error') {
      const messageEl = type === 'error' ? errorMessage : successMessage;
      const otherEl = type === 'error' ? successMessage : errorMessage;
      otherEl.style.display = 'none';
      messageEl.textContent = message;
      messageEl.style.display = 'block';
      setTimeout(() => { messageEl.style.display = 'none'; }, 5000);
    }
    function createLoadingCard() {
      const card = document.createElement('div');
      card.className = 'img-card loading';
      card.innerHTML = `<div class="spinner"></div><p class="status-text">Generating...</p>`;
      return card;
    }
    function createImageCard(imageData, prompt) {
      const card = document.createElement('div');
      card.className = 'img-card';
      card.innerHTML = `
        <img src="${imageData}" class="result-img" alt="Generated image">
        <div class="img-overlay">
          <button class="img-download-btn" onclick="downloadImage('${imageData}', '${prompt}')">
            <i class="fa-solid fa-download"></i>
          </button>
        </div>`;
      return card;
    }
    function downloadImage(imageUrl, prompt) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `ai-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    //  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
    // async function generateImages(prompt, model, count, aspectRatio) {
    //   // This is a placeholder. Replace with your actual API call.
    //   // For now, just return the same test image.
    //   const images = [];
    //   for (let i = 0; i < count; i++) {
    //     images.push('test.png');
    //   }
    //   return images;
    // }
    async function generateImages(prompt, model, count, aspectRatio) {
      const hf_token = "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"; // <-- Replace with your token

      const modelMap = {
        "stable-diffusion-xl": "stabilityai/stable-diffusion-xl-base-1.0",
        "stable-diffusion-v1-5": "runwayml/stable-diffusion-v1-5",
        "openjourney": "prompthero/openjourney"
      };

      const selectedModel = modelMap[model];
      const images = [];

      for (let i = 0; i < count; i++) {
        const res = await fetch(`https://api-inference.huggingface.co/models/${selectedModel}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hf_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ inputs: prompt })
        });

        if (!res.ok) throw new Error("API Error: " + res.status);

        const blob = await res.blob();
        const imageUrl = URL.createObjectURL(blob);
        images.push(imageUrl);
      }

      return images;
    }
    promptForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const prompt = promptInput.value.trim();
      const model = modelSelect.value;
      const imageCount = parseInt(imageCountSelect.value);
      const aspectRatio = aspectRatioSelect.value;
      if (!prompt || !model || !imageCount || !aspectRatio) {
        showMessage('Please fill all required fields!', 'error');
        return;
      }
      galleryGrid.innerHTML = '';
      for (let i = 0; i < imageCount; i++) galleryGrid.appendChild(createLoadingCard());
      generateBtn.disabled = true;
      generateBtn.classList.add('loading');
      generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Generating...</span>';
      try {
        const images = await generateImages(prompt, model, imageCount, aspectRatio);
        galleryGrid.innerHTML = '';
        images.forEach((img, index) => {
          const card = createImageCard(img, prompt);
          galleryGrid.appendChild(card);
        });
        showMessage(`Successfully generated ${imageCount} image(s)!`, 'success');
      } catch (err) {
        console.error(err);
        showMessage("Failed to generate image. Try again.", 'error');
      } finally {
        generateBtn.disabled = false;
        generateBtn.classList.remove('loading');
        generateBtn.innerHTML = '<i class="fa-solid fa-wand-sparkles"></i><span>Generate</span>';
      }
    });
    document.addEventListener('DOMContentLoaded', () => {
      modelSelect.value = 'stable-diffusion-xl';
      imageCountSelect.value = '1';
      aspectRatioSelect.value = '1:1';
    });
  