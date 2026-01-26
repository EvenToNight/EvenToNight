<template>
  <div class="about-page">
    <div class="about-container">
      <h1 class="about-title">Chi siamo</h1>

      <section class="about-section">
        <h2>La nostra missione</h2>
        <p>
          EvenToNight è nata con l'obiettivo di connettere le persone attraverso esperienze uniche.
          Crediamo che ogni evento sia un'opportunità per creare ricordi indimenticabili e costruire
          community.
        </p>
      </section>

      <section class="about-section">
        <h2>La nostra storia</h2>
        <p>
          Fondata nel 2025, EvenToNight è cresciuta rapidamente diventando la piattaforma di
          riferimento per la scoperta e la gestione di eventi. Dal primo giorno, abbiamo lavorato
          per rendere l'organizzazione e la partecipazione agli eventi semplice e accessibile a
          tutti.
        </p>
      </section>

      <section class="about-section">
        <h2>I nostri valori</h2>
        <ul class="values-list">
          <li>Innovazione continua per migliorare l'esperienza utente</li>
          <li>Trasparenza nelle comunicazioni e nelle transazioni</li>
          <li>Community al centro di tutto ciò che facciamo</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.about-page {
  min-height: calc(100vh - 200px);
  padding: $spacing-8;

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
  }
}

.about-container {
  max-width: 800px;
  margin: 0 auto;
}

.about-title {
  font-size: $font-size-4xl;
  font-weight: $font-weight-bold;
  margin-bottom: $spacing-8;
  text-align: center;

  @include light-mode {
    color: $color-text-primary;
  }

  @include dark-mode {
    color: $color-text-white;
  }

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-3xl;
  }
}

.about-section {
  margin-bottom: $spacing-8;

  h2 {
    font-size: $font-size-2xl;
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-4;

    @include light-mode {
      color: $color-text-primary;
    }

    @include dark-mode {
      color: $color-text-white;
    }
  }

  p {
    font-size: $font-size-lg;
    line-height: 1.8;
    margin-bottom: $spacing-4;

    @include light-mode {
      color: $color-text-secondary;
    }

    @include dark-mode {
      color: $color-text-dark;
    }
  }
}

.values-list {
  list-style: none;
  padding: 0;

  li {
    font-size: $font-size-lg;
    padding: $spacing-3;
    margin-bottom: $spacing-2;
    border-radius: $radius-lg;

    @include light-mode {
      background-color: $color-background;
      color: $color-text-secondary;
    }

    @include dark-mode {
      background-color: $color-background-dark;
      color: $color-text-dark;
    }

    &::before {
      content: '✓';
      margin-right: $spacing-2;
      color: $color-primary;
      font-weight: $font-weight-bold;
    }
  }
}
</style>
