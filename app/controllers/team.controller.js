const { validationResult } = require('express-validator');
const Team = require('../models/team.js');


// Create and Save a new team
exports.create = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  Team.where({ name: req.body.name }).findOne((mongoErr, foundTeam) => {
    if (foundTeam) {
      res.status(409).send({
        message: 'Team with name ${req.body.name already exists.',
      });
    } else {
      const team = new Team({
        name: req.body.name,
      });

      team.save()
        .then((data) => {
          res.status(201).send(data);
        }).catch((err) => {
          res.status(500).send({
            message: err.message || 'Some error occurred while creating the team.',
          });
        });
    }
  });
};

exports.findAll = (req, res) => {
  Team.find()
    .then((teams) => {
      res.send(teams);
    }).catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving teams.',
      });
    });
};

exports.findOne = (req, res) => {
  Team.findById(req.params.teamId)
    .then((team) => {
      if (!team) {
        return res.status(404).send({
          message: `Team not found with id ${req.params.teamId}`,
        });
      }
      return res.send(team);
    }).catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: `Team not found with id ${req.params.teamId}`,
        });
      }
      return res.status(500).send({
        message: `Error retrieving team with id ${req.params.teamId}`,
      });
    });
};

exports.update = (req, res) => {
  // validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  // Find team and update it with the request body
  return Team.findByIdAndUpdate(req.params.teamId, {
    name: req.body.name,
  }, { new: true })
    .then((team) => {
      if (!team) {
        return res.status(404).send({
          message: `Team not found with id ${req.params.teamId}`,
        });
      }
      return res.send(team);
    }).catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: `Team not found with id ${req.params.teamId}`,
        });
      }
      return res.status(500).send({
        message: `Error updating team with id ${req.params.teamId}`,
      });
    });
};

exports.delete = (req, res) => {
  Team.findByIdAndRemove(req.params.teamId)
    .then((team) => {
      if (!team) {
        return res.status(404).send({
          message: `Team not found with id ${req.params.teamId}`,
        });
      }
      return res.send({ message: 'Team deleted successfully!' });
    }).catch((err) => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: `Team not found with id ${req.params.teamId}`,
        });
      }
      return res.status(500).send({
        message: `Could not delete team with id ${req.params.teamId}`,
      });
    });
};
