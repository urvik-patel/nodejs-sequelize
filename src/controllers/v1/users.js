const db = require('../../models')
const response = require('../../services/Response')
const Op = require('sequelize').Op

module.exports = {
  findAll: async (req, res, next) => {
    try {
      const { search, gender, page = 1, limit = 10, sort = 'createdAt', order = 'DESC' } = req.headers
      var where = {}
      if (search) {
        where.email = { [Op.like]: `%${search}%` }
      }
      if (gender) {
        where.gender = { [Op.like]: gender }
      }

      const count = await db.user.count({
        where
      })
      if (!count) {
        response.errorResponseWithoutData(res, 'No records found!', 404)
      }
      const offset = 0 + (+limit * (+page - 1))
      const totalPages = Math.ceil(count / +limit)

      const data = await db.user.findAll({
        where: where,
        offset: +offset,
        limit: +limit,
        order: [[sort, order]]
      })
      response.successResponseData(res, data, 200, 'success', { totalPages: totalPages, currentPage: page, recordsPerPage: limit })
    } catch (error) {
      response.errorResponseData(res, error)
    }
  },

  getOneUser: async (req, res, next) => {
    try {
      const { id } = req.params
      if (!id) {
        return res.send({
          code: 400,
          message: 'Some of the required fields are missing.'
        })
      }
      const data = await db.user.findOne({
        where: { id }
      })
      response.successResponseData(res, data, 200, 'success')
    } catch (error) {
      response.errorResponseData(res, error)
    }
  },

  createUser: async (req, res, next) => {
    try {
      const { firstName, lastName, email } = req.body
      if (!firstName || !lastName || !email) {
        return res.send({
          code: 400,
          message: 'Some of the required fields are missing.'
        })
      }
      const data = await db.user.create(req.body)
      response.successResponseData(res, data, 201, 'success')
    } catch (error) {
      response.errorResponseData(res, error)
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const { id } = req.params
      const { firstName, lastName, email } = req.body
      if (!firstName || !lastName || !email || !id) {
        response.errorResponseData(res, null, 400, 'Some of the required fields are missing.')
      }
      const data = await db.user.update(req.body, {
        where: { id }
      })
      response.successResponseData(res, data, 200, 'success')
    } catch (error) {
      response.errorResponse(res, error)
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const { id } = req.params
      if (!id) {
        response.errorResponseData(res, null, 400, 'Some of the required fields are missing.')
      }
      const data = await db.user.destroy({
        where: { id }
      })
      response.successResponseData(res, data, 200, 'success')
    } catch (error) {
      response.errorResponseData(res, error)
    }
  }
}
