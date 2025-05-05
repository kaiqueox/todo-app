import mongoose from 'mongoose';
const TodoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  startDate: {  // Nova propriedade para data de início
    type: Date,
    default: null,
  },
  endDate: {  // Nova propriedade para data de término
    type: Date,
    default: null,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Todo deve pertencer a um usuário'],
  },
}, { timestamps: true });
const Todo = mongoose.model('Todo', TodoSchema);
export default Todo;