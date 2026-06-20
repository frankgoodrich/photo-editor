import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import sharp from 'sharp';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const projectSchema = new mongoose.Schema({
  name: String,
  thumbnail: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const Project = mongoose.model('Project', projectSchema);

app.post('/api/projects', async (req, res) => {
  try {
    const project = await Project.create({ name: req.body.name || 'Untitled' });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ updatedAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/process', async (req, res) => {
  try {
    const { image, adjustments, filters } = req.body;
    const buffer = Buffer.from(image.split(',')[1], 'base64');
    let pipeline = sharp(buffer);

    if (adjustments) {
      const ops = [];
      if (adjustments.brightness !== undefined) {
        ops.push(pipeline.modulate({ brightness: 1 + adjustments.brightness / 100 }));
        pipeline = sharp(buffer);
        for (const op of ops) pipeline = op;
      }
      if (adjustments.contrast !== undefined) {
        pipeline = pipeline.linear(1 + adjustments.contrast / 100, 0);
      }
      if (adjustments.saturation !== undefined) {
        pipeline = pipeline.modulate({ saturation: 1 + adjustments.saturation / 100 });
      }
      if (adjustments.blur !== undefined && adjustments.blur > 0) {
        pipeline = pipeline.blur(adjustments.blur);
      }
    }

    if (filters) {
      if (filters.grayscale) pipeline = pipeline.grayscale();
      if (filters.sepia) pipeline = pipeline.tint({ r: 112, g: 66, b: 20 });
      if (filters.invert) pipeline = pipeline.negate();
    }

    const processed = await pipeline.png().toBuffer();
    const base64 = `data:image/png;base64,${processed.toString('base64')}`;
    res.json({ image: base64 });
  } catch (err) {
    console.error('Process error:', err);
    res.status(500).json({ error: 'Processing failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
