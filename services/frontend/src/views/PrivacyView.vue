<template>
  <div class="privacy-page">
    <div class="privacy-container">
      <h1 class="privacy-title">Privacy Policy</h1>
      <p class="last-updated">Ultimo aggiornamento: 23/01/2025</p>

      <section class="privacy-section">
        <h2>Introduzione</h2>
        <p>
          In EvenToNight prendiamo molto seriamente la tua privacy. Questa Privacy Policy spiega
          come raccogliamo, utilizziamo e proteggiamo le tue informazioni personali quando utilizzi
          la nostra piattaforma.
        </p>
      </section>

      <section class="privacy-section">
        <h2>Dati che raccogliamo</h2>
        <p>
          Raccogliamo informazioni che ci fornisci direttamente (nome, email, dati di pagamento) e
          informazioni raccolte automaticamente (indirizzo IP, tipo di browser, pagine visitate).
          Tutti i dati sono raccolti in conformità con il GDPR.
        </p>
      </section>

      <section class="privacy-section">
        <h2>Come utilizziamo i tuoi dati</h2>
        <p>
          Utilizziamo i tuoi dati per: fornire e migliorare i nostri servizi, processare i
          pagamenti, comunicare con te, personalizzare la tua esperienza, garantire la sicurezza
          della piattaforma.
        </p>
      </section>

      <section class="privacy-section">
        <h2>Come proteggiamo i tuoi dati</h2>
        <p>
          Implementiamo misure di sicurezza tecniche e organizzative per proteggere i tuoi dati
          personali da accessi non autorizzati, perdita o alterazione. Utilizziamo crittografia
          SSL/TLS per tutte le transazioni.
        </p>
      </section>

      <section class="privacy-section">
        <h2>I tuoi diritti</h2>
        <p>
          Hai il diritto di: accedere ai tuoi dati, rettificare dati inesatti, richiedere la
          cancellazione, opporti al trattamento, richiedere la portabilità dei dati. Per esercitare
          questi diritti, contattaci.
        </p>
      </section>

      <section class="privacy-section">
        <h2>Contattaci</h2>
        <p>
          Per qualsiasi domanda riguardo questa Privacy Policy, puoi contattarci tramite il modulo
          di contatto o via email a privacy@eventonight.com
        </p>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.privacy-page {
  min-height: calc(100vh - 200px);
  padding: $spacing-8;

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
  }
}

.privacy-container {
  max-width: 900px;
  margin: 0 auto;
}

.privacy-title {
  font-size: $font-size-4xl;
  font-weight: $font-weight-bold;
  margin-bottom: $spacing-2;
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

.last-updated {
  text-align: center;
  font-size: $font-size-sm;
  margin-bottom: $spacing-8;

  @include light-mode {
    color: $color-text-muted;
  }

  @include dark-mode {
    color: rgba($color-text-dark, 0.7);
  }
}

.privacy-section {
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
    font-size: $font-size-base;
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
</style>
