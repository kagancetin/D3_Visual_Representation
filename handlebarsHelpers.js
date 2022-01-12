module.exports = {
  ifCond: (v1, operator, v2, options) => {
    switch (operator) {
      case '==':
        return (v1 == v2) ? options.fn(this) : options.inverse(this)
      case '===':
        return (v1 === v2) ? options.fn(this) : options.inverse(this)
      case '!=':
        return (v1 != v2) ? options.fn(this) : options.inverse(this)
      case '!==':
        return (v1 !== v2) ? options.fn(this) : options.inverse(this)
      case '<':
        return (v1 < v2) ? options.fn(this) : options.inverse(this)
      case '<=':
        return (v1 <= v2) ? options.fn(this) : options.inverse(this)
      case '>':
        return (v1 > v2) ? options.fn(this) : options.inverse(this)
      case '>=':
        return (v1 >= v2) ? options.fn(this) : options.inverse(this)
      case '&&':
        return (v1 && v2) ? options.fn(this) : options.inverse(this)
      case '||':
        return (v1 || v2) ? options.fn(this) : options.inverse(this)
      default:
        return options.inverse(this)
    }
  },
  section: function (name, options) {
    if (!this._sections) this._sections = {}
    this._sections[name] = options.fn(this)
    return null
  },
  json: function (context) {
    return JSON.stringify(context)
  },
  inc: function (number) {
    return parseInt(number) + 1
  },
  dateConv: (date) => {
    date = Date.now() - date
    date /= 1000
    if (date < 60)
      return Math.round(date) + " Saniye önce"
    date /= 60
    if (date < 60)
      return Math.round(date) + " Dakika önce"
    date /= 60
    if (date < 24)
      return Math.round(date) + " Saat önce"
    date /= 24
    if (date < 7)
      return Math.round(date) + " Gün önce"
    if (date < 30)
      return Math.round(date / 7) + " Hafta önce"
    date /= 30
    if (date < 12)
      return Math.round(date) + " Ay önce"
    date /= 12
    return Math.round(date) + " Yıl önce"
  }
}