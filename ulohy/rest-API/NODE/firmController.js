const { Firm, Contact } = require('../models');

exports.listFirms = async (req, res) => {
  const firms = await Firm.findAll({ include: 'contacts' });
  res.json(firms);
};

exports.saveFirm = async (req, res) => {
  const firm = await Firm.create(req.body);
  res.status(201).json(firm);
};

exports.updateFirm = async (req, res) => {
  const { id } = req.params;
  const firm = await Firm.findByPk(id);
  if (!firm) return res.status(404).json({ error: 'Firm not found' });
  await firm.update(req.body);
  res.json(firm);
};

exports.deleteFirm = async (req, res) => {
  const { id } = req.params;
  const firm = await Firm.findByPk(id);
  if (!firm) return res.status(404).json({ error: 'Firm not found' });
  await firm.destroy();
  res.json({ message: 'Firm deleted' });
};

exports.saveContact = async (req, res) => {
  const { id } = req.params;
  const firm = await Firm.findByPk(id);
  if (!firm) return res.status(404).json({ error: 'Firm not found' });
  const contact = await firm.createContact(req.body);
  res.status(201).json(contact);
};
