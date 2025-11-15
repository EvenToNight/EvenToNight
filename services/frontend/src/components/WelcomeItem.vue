<template>
  <div class="item">
    <i>
      <slot name="icon"></slot>
    </i>
    <div class="details">
      <h3>
        <slot name="heading"></slot>
      </h3>
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.item {
  margin-top: 2rem;
  display: flex;
  position: relative;
}

.details {
  flex: 1;
  margin-left: 1rem;
}

i {
  display: flex;
  place-items: center;
  place-content: center;
  width: 32px;
  height: 32px;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

h3 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: $color-heading;

  @include dark-mode {
    color: $color-heading-dark;
  }
}

@include respond-to('lg') {
  .item {
    margin-top: 0;
    padding: 0.4rem 0 1rem calc($spacing-section / 2);
  }

  i {
    top: calc(50% - 25px);
    left: -26px;
    position: absolute;
    border: 1px solid $color-border;
    background: $color-background;
    border-radius: 8px;
    width: 50px;
    height: 50px;

    @include dark-mode {
      border-color: $color-border-dark;
      background: $color-background-dark;
    }
  }

  .item:before {
    content: ' ';
    border-left: 1px solid $color-border;
    position: absolute;
    left: 0;
    bottom: calc(50% + 25px);
    height: calc(50% - 25px);

    @include dark-mode {
      border-color: $color-border-dark;
    }
  }

  .item:after {
    content: ' ';
    border-left: 1px solid $color-border;
    position: absolute;
    left: 0;
    top: calc(50% + 25px);
    height: calc(50% - 25px);

    @include dark-mode {
      border-color: $color-border-dark;
    }
  }

  .item:first-of-type:before {
    display: none;
  }

  .item:last-of-type:after {
    display: none;
  }
}
</style>
