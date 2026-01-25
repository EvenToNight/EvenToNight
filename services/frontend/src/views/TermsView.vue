<template>
  <div class="terms-page">
    <div class="terms-container">
      <h1 class="terms-title">Termini e Condizioni</h1>
      <p class="last-updated">Ultimo aggiornamento: 23/01/2025</p>

      <section class="terms-section">
        <h2>Accettazione dei termini</h2>
        <p>
          Utilizzando EvenToNight, accetti di essere vincolato da questi Termini e Condizioni. Se
          non accetti questi termini, ti preghiamo di non utilizzare la piattaforma.
        </p>
      </section>

      <section class="terms-section">
        <h2>Uso del servizio</h2>
        <p>
          Ti impegni a utilizzare EvenToNight solo per scopi legittimi e in conformità con tutte le
          leggi applicabili. È vietato caricare contenuti offensivi, illegali o che violano i
          diritti di terzi.
        </p>
      </section>

      <section class="terms-section">
        <h2>Account utente</h2>
        <p>
          Sei responsabile della sicurezza del tuo account e delle password. Devi notificarci
          immediatamente qualsiasi accesso non autorizzato. Non puoi trasferire il tuo account a
          terzi.
        </p>
      </section>

      <section class="terms-section">
        <h2>Pagamenti e biglietti</h2>
        <p>
          I pagamenti sono processati attraverso fornitori di servizi di pagamento sicuri. I prezzi
          sono indicati chiaramente prima dell'acquisto. Una volta completato l'acquisto, riceverai
          i biglietti via email.
        </p>
      </section>

      <section class="terms-section">
        <h2>Rimborsi e cancellazioni</h2>
        <p>
          La politica di rimborso dipende dall'organizzatore dell'evento. In caso di cancellazione
          dell'evento da parte dell'organizzatore, hai diritto al rimborso completo. Contatta il
          supporto per richieste di rimborso.
        </p>
      </section>

      <section class="terms-section">
        <h2>Limitazione di responsabilità</h2>
        <p>
          EvenToNight funge da piattaforma di intermediazione tra organizzatori e partecipanti. Non
          siamo responsabili per la qualità degli eventi, cancellazioni o problemi che si verificano
          durante gli eventi.
        </p>
      </section>

      <section class="terms-section">
        <h2>Modifiche ai termini</h2>
        <p>
          Ci riserviamo il diritto di modificare questi Termini e Condizioni in qualsiasi momento.
          Le modifiche saranno effettive immediatamente dopo la pubblicazione. L'uso continuato
          della piattaforma costituisce accettazione delle modifiche.
        </p>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.terms-page {
  min-height: calc(100vh - 200px);
  padding: $spacing-8;

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
  }
}

.terms-container {
  max-width: 900px;
  margin: 0 auto;
}

.terms-title {
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

.terms-section {
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
