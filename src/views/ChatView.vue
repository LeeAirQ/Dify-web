<template>
  <div class="chat-container">
    <!-- Header -->
    <div class="chat-header">
      <div class="header-content">
        <div class="logo-area">
          <div class="logo">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 14.8333C20 19.5167 12 23.5 12 23.5C12 23.5 4 19.5167 4 14.8333C4 12.2731 5.05357 9.81848 6.92893 8.05178C8.8043 6.28509 11.3478 5.3 14 5.3C16.6522 5.3 19.1957 6.28509 21.0711 8.05178C22.9464 9.81848 24 12.2731 24 14.8333Z" fill="url(#paint0_linear)"/>
              <!-- ... 省略中间路径 ... -->
              <defs>
                <linearGradient id="paint0_linear" x1="4" y1="5.3" x2="20" y2="23.5" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#7C3AED"/>
                  <stop offset="1" stop-color="#6D28D9"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 class="app-title">Dify AI-Web</h1>
        </div>
      </div>
    </div>

    <!-- Replaced content with iframe -->
    <div class="iframe-container">
      <iframe 
        src="http://120.77.168.202/chatbot/D8ReNOYB5SuAJPFf"
        style="width: 100%; height: 100%; min-height: 700px;"
        frameborder="0"
        allow="microphone">
      </iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
// 无需 JavaScript 逻辑，已简化
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  background-color: var(--neutral-50);
}

.chat-header {
  background-color: white;
  box-shadow: var(--shadow-sm);
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  width: 28px;
  height: 28px;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--neutral-800);
  margin: 0;
}

.iframe-container {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-top: 1px solid var(--neutral-200);
}
</style>
