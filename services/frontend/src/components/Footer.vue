<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-brand">
          <img src="/logo.png" alt="EvenToNight Logo" class="footer-logo" />
          <span class="footer-brand-text">EvenToNight</span>
        </div>

        <div class="footer-links">
          <a href="#" class="footer-link">About</a>
          <a href="#" class="footer-link">Events</a>
          <a href="#" class="footer-link">Contact</a>
          <a href="#" class="footer-link">Privacy Policy</a>
        </div>

        <div class="footer-bottom">
          <p class="footer-copyright">© 2025 EvenToNight. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  width: 100%;
  margin-top: auto;

  @include light-mode {
    background-color: #f8f8f8;
    border-top: 1px solid $color-border;
  }

  @include dark-mode {
    background-color: #1a1a1a;
    border-top: 1px solid $color-border-dark;
  }
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: $spacing-8 $spacing-4;

  @media (max-width: 768px) {
    padding: $spacing-6 $spacing-4;
  }
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-6;
  align-items: center;
  text-align: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: $spacing-2;
}

.footer-logo {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.footer-brand-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: $color-primary;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-4;
  justify-content: center;

  @media (max-width: 480px) {
    gap: $spacing-3;
  }
}

.footer-link {
  text-decoration: none;
  font-size: 0.95rem;
  transition: color $transition-base;

  @include light-mode {
    color: $color-text-secondary;

    &:hover {
      color: $color-primary;
    }
  }

  @include dark-mode {
    color: $color-text-dark;

    &:hover {
      color: $color-primary;
    }
  }
}

.footer-bottom {
  width: 100%;
  padding-top: $spacing-4;

  @include light-mode {
    border-top: 1px solid $color-border;
  }

  @include dark-mode {
    border-top: 1px solid $color-border-dark;
  }
}

.footer-copyright {
  margin: 0;
  font-size: 0.875rem;

  @include light-mode {
    color: $color-text-muted;
  }

  @include dark-mode {
    color: rgba($color-text-dark, 0.7);
  }
}
</style>
