export default {
  computed: {
    typeClass() {
      return this.input.type
        .split(/(?=[A-Z])/)
        .reduce(
          (acc, part) => acc + (acc.length ? '-' : '') + part.toLowerCase(),
          ''
        )
    },
    rotation() {
      return Number.isFinite(this.input.direction)
        ? Math.round(Math.round((this.input.direction + 360) % 360) / 5) * 5
        : 0
    },
    invertedRotation() {
      return 360 - this.rotation
    },
    severity() {
      if (this.input.severity < 2 || this.input.severity > 4) {
        return 0
      }
      return this.input.severity
    },
  },
}
