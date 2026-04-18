const express = require('express')
const router = express.Router()
const employeeController = require('../controllers/employeeController')
const userAuth = require('../middleware/userAuth')

// All employee routes should be protected and only accessible by admin (type: 'user')
router.use(userAuth) 
router.use((req, res, next) => {
  if (req.user.type !== 'user') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
})
router.route('/')
  .post(employeeController.createEmployee)
  .get(employeeController.getAllEmployees)

router.route('/:id')
  .put(employeeController.updateEmployee)
  .delete(employeeController.deleteEmployee)

module.exports = router
