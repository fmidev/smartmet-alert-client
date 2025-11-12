<template>
  <div :class="['collapsible-panel', theme, 'mobile-only']">
    <div class="panel-header">
      <div class="panel-title">
        <span class="panel-text">
          {{ title }}
        </span>
      </div>
      <button
        :class="['panel-toggle', visible ? '' : 'collapsed']"
        :aria-expanded="visible"
        :aria-label="title"
        @click="onToggle"
      ></button>
    </div>
    <Transition name="collapse">
      <div
        v-if="visible"
        class="panel-body"
      >
        <div class="panel-content">
          <slot></slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
export default {
  name: 'CollapsiblePanel',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    theme: {
      type: String,
      default: 'light-theme',
    },
  },
  methods: {
    onToggle() {
      this.$emit('toggle')
    },
  },
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

.collapsible-panel {
  margin-left: 0;
  margin-right: 0;
  margin-bottom: 0.25rem;
  border-radius: 0;
}

.light-theme.collapsible-panel {
  border: 0.5px solid $light-legend-background-color;
}

.dark-theme.collapsible-panel {
  border: 0.5px solid $dark-legend-background-color;
}

.light-gray-theme.collapsible-panel {
  border: 0.5px solid $light-gray-legend-background-color;
}

.dark-gray-theme.collapsible-panel {
  border: 0.5px solid $dark-gray-legend-background-color;
}

.panel-header {
  height: $current-warning-height;
  padding: 0 0 0 15px;
  line-height: $current-warning-height;
  border: none;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.125);
  border-radius: 0;
  position: relative;
}

.light-theme .panel-header {
  background-color: $light-legend-heading-background-color;
}

.dark-theme .panel-header {
  background-color: $dark-legend-heading-background-color;
}

.light-gray-theme .panel-header {
  background-color: $light-gray-legend-heading-background-color;
}

.dark-gray-theme .panel-header {
  background-color: $dark-gray-legend-heading-background-color;
}

.panel-title {
  position: absolute;
  left: 0;
  right: 38px;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: start;
  height: $current-warning-height;
}

.light-theme .panel-title {
  background: $light-legend-heading-background-color;
}

.dark-theme .panel-title {
  background: $dark-legend-heading-background-color;
}

.light-gray-theme .panel-title {
  background: $light-gray-legend-heading-background-color;
}

.dark-gray-theme .panel-title {
  background: $dark-gray-legend-heading-background-color;
}

.panel-text {
  display: block;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 15px;
}

.light-theme .panel-text {
  background-color: $light-legend-heading-background-color;
}

.dark-theme .panel-text {
  background-color: $dark-legend-heading-background-color;
}

.light-gray-theme .panel-text {
  background-color: $light-gray-legend-heading-background-color;
}

.dark-gray-theme .panel-text {
  background-color: $dark-gray-legend-heading-background-color;
}

button.panel-toggle {
  position: relative;
  height: $current-warning-height;
  width: $current-warning-height;
  min-width: $current-warning-height;
  background-image: url($ui-image-path + 'arrow-up.svg');
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 0;
  border-style: none;
  float: right;
  padding: $image-padding;
  margin-left: 5px;
  cursor: pointer;

  &.collapsed {
    background-image: url($ui-image-path + 'arrow-down.svg');
    border-radius: 0 3px 3px 0;
  }
}

.light-theme .panel-toggle {
  background-color: $light-legend-toggle-background-color;

  &:hover {
    background-color: $light-legend-toggle-background-color;
  }

  &:active {
    background-color: $light-current-warning-toggle-active-color;
  }
}

.dark-theme .panel-toggle {
  background-color: $dark-legend-toggle-background-color;

  &:hover {
    background-color: $dark-legend-toggle-background-color;
  }

  &:active {
    background-color: $dark-current-warning-toggle-active-color;
  }
}

.light-gray-theme .panel-toggle {
  background-color: $light-gray-legend-toggle-background-color;

  &:hover {
    background-color: $light-gray-legend-toggle-background-color;
  }

  &:active {
    background-color: $light-gray-current-warning-toggle-active-color;
  }
}

.dark-gray-theme .panel-toggle {
  background-color: $dark-gray-legend-toggle-background-color;

  &:hover {
    background-color: $dark-gray-legend-toggle-background-color;
  }

  &:active {
    background-color: $dark-gray-current-warning-toggle-active-color;
  }
}

.panel-body {
  overflow: hidden;
}

.panel-content {
  padding: 15px;
  border-radius: 0;
}

.light-theme .panel-content {
  background-color: $light-legend-container-background-color;
  border-top: 0.5px solid $light-legend-background-color;
}

.dark-theme .panel-content {
  background-color: $dark-legend-container-background-color;
  border-top: 0.5px solid $dark-legend-background-color;
}

.light-gray-theme .panel-content {
  background-color: $light-gray-legend-container-background-color;
  border-top: 0.5px solid $light-gray-legend-background-color;
}

.dark-gray-theme .panel-content {
  background-color: $dark-gray-legend-container-background-color;
  border-top: 0.5px solid $dark-gray-legend-background-color;
}

// Collapse transition
.collapse-enter-active,
.collapse-leave-active {
  transition:
    max-height 0.35s ease,
    opacity 0.35s ease;
  overflow: hidden;
}

.collapse-enter-from {
  max-height: 0;
  opacity: 0;
}

.collapse-enter-to {
  max-height: 2000px;
  opacity: 1;
}

.collapse-leave-from {
  max-height: 2000px;
  opacity: 1;
}

.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
