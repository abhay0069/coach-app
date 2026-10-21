// Curated knowledge base used by the local AI fallback. Designed to produce
// useful, realistic roadmaps & quizzes for common skills without needing an
// external API. Each entry maps keywords -> modules -> lessons and a question
// bank. Generic fallback is always included.

type KBEntry = {
  keywords: string[];
  modules: { title: string; description: string; lessons: { title: string; description: string; objective: string; minutes: number; type?: 'lesson' | 'exercise' }[] }[];
  projects?: { title: string; description: string; objective: string }[];
  questions: { question: string; type: 'multiple_choice' | 'true_false' | 'short_answer' | 'scenario'; options?: string[]; correct_answer: string; explanation: string; topic: string; topics?: string[] }[];
};

const pythonKB: KBEntry = {
  keywords: ['python', 'django', 'flask', 'pandas'],
  modules: [
    {
      title: 'Python Foundations',
      description: 'Core syntax, data types, and control flow',
      lessons: [
        { title: 'Installing Python & Your First Program', description: 'Set up your environment and print Hello World', objective: 'Run a Python script and understand the interpreter', minutes: 20 },
        { title: 'Variables & Data Types', description: 'int, float, str, bool, type conversion', objective: 'Create and convert variables of different types', minutes: 25 },
        { title: 'Strings & String Formatting', description: 'Slicing, methods, f-strings', objective: 'Manipulate and format strings confidently', minutes: 25 },
        { title: 'Numbers & Math', description: 'Arithmetic, math module, rounding', objective: 'Perform calculations and use math functions', minutes: 20 },
        { title: 'Practice: Number Guesser', description: 'Build a small CLI guessing game', objective: 'Combine input, variables and conditionals', minutes: 30, type: 'exercise' },
      ],
    },
    {
      title: 'Control Flow & Collections',
      description: 'Conditionals, loops, lists, dicts',
      lessons: [
        { title: 'If / Elif / Else', description: 'Conditional logic and boolean expressions', objective: 'Write decision-making code', minutes: 25 },
        { title: 'Lists & Tuples', description: 'Ordered collections, indexing, methods', objective: 'Store and access sequences of data', minutes: 30 },
        { title: 'For & While Loops', description: 'Iteration, break, continue, range', objective: 'Repeat actions efficiently', minutes: 30 },
        { title: 'Dictionaries & Sets', description: 'Key-value stores and unique collections', objective: 'Use dicts for structured data', minutes: 30 },
        { title: 'Practice: To-Do List CLI', description: 'Build a command-line task manager', objective: 'Combine lists, loops, and dicts', minutes: 35, type: 'exercise' },
      ],
    },
    {
      title: 'Functions & Modules',
      description: 'Write reusable code and organise projects',
      lessons: [
        { title: 'Defining Functions', description: 'def, parameters, return values', objective: 'Write and call your own functions', minutes: 25 },
        { title: 'Scope & Args/Kwargs', description: 'Variable scope, default args, *args, **kwargs', objective: 'Design flexible function signatures', minutes: 25 },
        { title: 'Lambda & Higher-Order Functions', description: 'map, filter, sorted with lambdas', objective: 'Use functional-style helpers', minutes: 20 },
        { title: 'Modules & Imports', description: 'Importing, __name__, packages', objective: 'Split code across files cleanly', minutes: 20 },
      ],
    },
    {
      title: 'Working with Data',
      description: 'Files, error handling, and OOP basics',
      lessons: [
        { title: 'Reading & Writing Files', description: 'open, with, paths, CSV basics', objective: 'Persist data to disk', minutes: 25 },
        { title: 'Try / Except Error Handling', description: 'Exceptions, raising, finally', objective: 'Handle errors gracefully', minutes: 25 },
        { title: 'Classes & Objects', description: 'Classes, attributes, methods, __init__', objective: 'Model data with classes', minutes: 30 },
        { title: 'Practice: Contact Book', description: 'Store contacts in a JSON file with CRUD', objective: 'Combine files, classes, and error handling', minutes: 40, type: 'exercise' },
      ],
    },
  ],
  projects: [
    { title: 'Mini Project: Quiz Game', description: 'Build a multi-question quiz app that tracks score.', objective: 'Combine control flow, lists and user input into a working game.' },
    { title: 'Mini Project: Weather CLI', description: 'Fetch real weather data from a public API and display it.', objective: 'Use requests, JSON parsing, and error handling.' },
  ],
  questions: [
    { question: 'Which keyword defines a function in Python?', type: 'multiple_choice', options: ['func', 'def', 'function', 'lambda'], correct_answer: 'def', explanation: 'Functions are defined with the `def` keyword. `lambda` creates anonymous one-liners.', topic: 'functions', topics: ['function', 'def'] },
    { question: 'What is the output of print(type(5) == int)?', type: 'multiple_choice', options: ['True', 'False', 'None', 'Error'], correct_answer: 'True', explanation: 'type(5) returns int, so the comparison is True.', topic: 'data types', topics: ['variable', 'type', 'number'] },
    { question: 'Lists in Python are mutable.', type: 'true_false', options: ['True', 'False'], correct_answer: 'True', explanation: 'You can change list elements after creation (unlike tuples).', topic: 'lists', topics: ['list'] },
    { question: 'Which loop is best when you do not know how many iterations you need?', type: 'multiple_choice', options: ['for', 'while', 'do-while', 'foreach'], correct_answer: 'while', explanation: 'while loops continue until a condition becomes False.', topic: 'loops', topics: ['loop', 'while'] },
    { question: 'How do you open a file safely so it always closes?', type: 'multiple_choice', options: ['file.open()', 'with open(...) as f:', 'try/open', 'open(file, close=True)'], correct_answer: 'with open(...) as f:', explanation: 'The `with` context manager automatically closes the file.', topic: 'files', topics: ['file', 'read', 'write'] },
    { question: 'What is a dictionary key requirement in Python?', type: 'short_answer', correct_answer: 'Keys must be hashable / immutable', explanation: 'Dictionary keys must be of an immutable type (strings, numbers, tuples of immutables).', topic: 'dictionaries', topics: ['dict', 'dictionar'] },
    { question: 'A user enters text via input(). How do you convert it to an integer?', type: 'short_answer', correct_answer: 'int(input())', explanation: 'input() returns a string; wrap it with int() to convert.', topic: 'input', topics: ['input', 'type'] },
  ],
};

const reactKB: KBEntry = {
  keywords: ['react', 'jsx', 'frontend', 'web dev', 'web development'],
  modules: [
    {
      title: 'React Essentials',
      description: 'Components, JSX, props',
      lessons: [
        { title: 'Setting Up a React Project', description: 'Vite/CRA, project structure', objective: 'Run a React dev server locally', minutes: 20 },
        { title: 'JSX & Components', description: 'JSX syntax, function components', objective: 'Compose UI with reusable components', minutes: 25 },
        { title: 'Props', description: 'Passing data, default props, children', objective: 'Configure components via props', minutes: 25 },
        { title: 'Conditional Rendering & Lists', description: '&&, ternaries, map() with keys', objective: 'Render dynamic lists and conditions', minutes: 30 },
      ],
    },
    {
      title: 'State & Events',
      description: 'useState, event handling',
      lessons: [
        { title: 'useState Hook', description: 'Adding state to components', objective: 'Track and update UI state', minutes: 30 },
        { title: 'Handling Events', description: 'onClick, onChange, synthetic events', objective: 'Respond to user interactions', minutes: 25 },
        { title: 'Controlled Forms', description: 'Input state and form submission', objective: 'Build forms controlled by React state', minutes: 30 },
        { title: 'Practice: Counter & Todo List', description: 'Build an interactive todo app', objective: 'Combine state, events and lists', minutes: 40, type: 'exercise' },
      ],
    },
    {
      title: 'Effects & Data',
      description: 'useEffect, data fetching',
      lessons: [
        { title: 'useEffect Basics', description: 'Lifecycle, dependencies array', objective: 'Run side effects at the right time', minutes: 30 },
        { title: 'Fetching Data', description: 'fetch/axios, async/await, loading/error states', objective: 'Load remote data into components', minutes: 30 },
        { title: 'Custom Hooks', description: 'Reusable logic extracted into hooks', objective: 'Write your own hooks', minutes: 25 },
      ],
    },
    {
      title: 'Routing & Advanced Patterns',
      description: 'Navigation, context, reducers',
      lessons: [
        { title: 'React Router', description: 'Pages, routes, navigation', objective: 'Add multi-page navigation', minutes: 30 },
        { title: 'useContext', description: 'Global state without prop drilling', objective: 'Share state across components', minutes: 25 },
        { title: 'useReducer', description: 'Complex state transitions', objective: 'Manage non-trivial state predictably', minutes: 25 },
        { title: 'Practice: Personal Dashboard', description: 'A small dashboard with routing and data', objective: 'Combine router, state and effects', minutes: 45, type: 'exercise' },
      ],
    },
  ],
  projects: [
    { title: 'Mini Project: Weather App', description: 'Fetch weather by city with search and error states.', objective: 'Use state, effects, forms and API calls in one app.' },
    { title: 'Mini Project: Recipe Finder', description: 'Search recipes, view details, save favorites.', objective: 'Combine routing, context, and async data.' },
  ],
  questions: [
    { question: 'What is JSX?', type: 'multiple_choice', options: ['A database', 'A syntax extension that looks like HTML in JS', 'A CSS framework', 'A test library'], correct_answer: 'A syntax extension that looks like HTML in JS', explanation: 'JSX lets you write markup inside JavaScript; React transforms it into function calls.', topic: 'jsx', topics: ['jsx', 'component'] },
    { question: 'How do you pass data into a component?', type: 'short_answer', correct_answer: 'Via props', explanation: 'Props are the inputs to a React component.', topic: 'props', topics: ['prop'] },
    { question: 'Which hook adds local state to a function component?', type: 'multiple_choice', options: ['useEffect', 'useState', 'useMemo', 'useRef'], correct_answer: 'useState', explanation: 'useState returns a state value and a setter.', topic: 'state', topics: ['state', 'usestate'] },
    { question: 'You must include a unique key when rendering lists in React.', type: 'true_false', options: ['True', 'False'], correct_answer: 'True', explanation: 'Keys help React identify which items changed.', topic: 'lists', topics: ['list', 'key', 'map'] },
    { question: 'What hook runs side effects like data fetching?', type: 'multiple_choice', options: ['useState', 'useEffect', 'useContext', 'useCallback'], correct_answer: 'useEffect', explanation: 'useEffect runs after render based on its dependency array.', topic: 'effects', topics: ['effect', 'useeffect', 'fetch'] },
  ],
};

const aiKB: KBEntry = {
  keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning'],
  modules: [
    {
      title: 'Foundations',
      description: 'What ML is and how to think about problems',
      lessons: [
        { title: 'What is Machine Learning?', description: 'Types: supervised, unsupervised, reinforcement', objective: 'Distinguish ML paradigms and use cases', minutes: 25 },
        { title: 'Python & NumPy Refresher', description: 'Arrays, vectorization, broadcasting', objective: 'Use NumPy for numeric code', minutes: 30 },
        { title: 'Setting up your ML Environment', description: 'Installing scikit-learn, Jupyter, pandas', objective: 'Run a Jupyter notebook and import key libraries', minutes: 20 },
      ],
    },
    {
      title: 'Core Algorithms',
      description: 'Regression, classification, evaluation',
      lessons: [
        { title: 'Linear Regression', description: 'Model, cost function, gradient descent intuition', objective: 'Fit and interpret a regression model', minutes: 35 },
        { title: 'Logistic Regression & Classification', description: 'Sigmoid, decision boundaries, accuracy', objective: 'Build a binary classifier', minutes: 30 },
        { title: 'Train/Test Splits & Metrics', description: 'Overfitting, precision, recall, confusion matrix', objective: 'Evaluate a model correctly', minutes: 30 },
        { title: 'Decision Trees & Random Forests', description: 'Ensembles, feature importance', objective: 'Apply tree-based models', minutes: 30 },
      ],
    },
    {
      title: 'Neural Networks Intro',
      description: 'Perceptron, backprop, frameworks',
      lessons: [
        { title: 'Perceptron & Feedforward Nets', description: 'Layers, activations, forward pass', objective: 'Understand how a neural net computes outputs', minutes: 35 },
        { title: 'Training with Backpropagation', description: 'Loss, gradients, optimizers', objective: 'Explain how networks learn', minutes: 35 },
        { title: 'Your First Neural Net in PyTorch', description: 'Build, train, evaluate', objective: 'Implement a small network from scratch', minutes: 40, type: 'exercise' },
      ],
    },
  ],
  projects: [
    { title: 'Mini Project: House Price Predictor', description: 'Train a regression model on tabular data.', objective: 'End-to-end: load, clean, model, evaluate.' },
    { title: 'Mini Project: Image Classifier', description: 'Use a pre-trained model to classify images.', objective: 'Fine-tune a CNN and measure accuracy.' },
  ],
  questions: [
    { question: 'Which of these is a supervised learning task?', type: 'multiple_choice', options: ['Clustering customers', 'Predicting house prices from labeled data', 'Dimensionality reduction', 'Finding anomalies'], correct_answer: 'Predicting house prices from labeled data', explanation: 'Supervised learning uses labeled outputs.', topic: 'basics', topics: ['supervis', 'ml'] },
    { question: 'Overfitting means the model performs well on training data but poorly on new data.', type: 'true_false', options: ['True', 'False'], correct_answer: 'True', explanation: 'Overfitting memorizes training data.', topic: 'overfitting', topics: ['overfit', 'general'] },
    { question: 'Which library is most commonly used for numeric arrays in Python ML?', type: 'multiple_choice', options: ['pandas', 'numpy', 'matplotlib', 'django'], correct_answer: 'numpy', explanation: 'NumPy provides fast array operations.', topic: 'numpy', topics: ['numpy', 'python'] },
    { question: 'What function introduces non-linearity in a neural network layer?', type: 'short_answer', correct_answer: 'Activation function', explanation: 'Functions like ReLU, sigmoid, tanh add non-linearity.', topic: 'neural networks', topics: ['activation', 'neural', 'perceptron'] },
  ],
};

const designKB: KBEntry = {
  keywords: ['design', 'graphic design', 'ui design', 'ux design', 'figma'],
  modules: [
    {
      title: 'Design Fundamentals',
      description: 'Typography, color, layout',
      lessons: [
        { title: 'Typography Basics', description: 'Fonts, hierarchy, spacing', objective: 'Choose and pair fonts deliberately', minutes: 25 },
        { title: 'Color Theory', description: 'Palettes, contrast, meaning', objective: 'Build accessible color palettes', minutes: 25 },
        { title: 'Layout & Grid Systems', description: 'Alignment, whitespace, grids', objective: 'Compose balanced, consistent layouts', minutes: 30 },
        { title: 'Practice: Landing Page Redesign', description: 'Redesign a simple landing page', objective: 'Apply type, color, and layout principles', minutes: 40, type: 'exercise' },
      ],
    },
    {
      title: 'UI Components & Patterns',
      description: 'Buttons, forms, navigation',
      lessons: [
        { title: 'Buttons & CTAs', description: 'Hierarchy, states, accessibility', objective: 'Design clear call-to-action buttons', minutes: 20 },
        { title: 'Forms & Inputs', description: 'Labels, errors, autofill', objective: 'Design usable forms', minutes: 25 },
        { title: 'Navigation Patterns', description: 'Tabs, drawers, bottom nav', objective: 'Pick the right navigation for the job', minutes: 25 },
      ],
    },
    {
      title: 'Figma Workflow',
      description: 'Components, auto-layout, prototyping',
      lessons: [
        { title: 'Figma Fundamentals', description: 'Frames, shapes, layers', objective: 'Navigate Figma confidently', minutes: 20 },
        { title: 'Components & Variants', description: 'Reusable UI kits', objective: 'Build a small design system', minutes: 30 },
        { title: 'Prototyping & Handoff', description: 'Interactive flows and developer handoff', objective: 'Create a clickable prototype', minutes: 30 },
      ],
    },
  ],
  projects: [
    { title: 'Mini Project: Mobile App Concept', description: 'Design a 3-screen mobile app.', objective: 'Combine components, typography, and prototype interactions.' },
  ],
  questions: [
    { question: 'Which property most affects visual hierarchy?', type: 'multiple_choice', options: ['Color', 'Contrast & size', 'Border radius', 'Animation'], correct_answer: 'Contrast & size', explanation: 'Size and contrast guide the eye to what matters most.', topic: 'hierarchy', topics: ['typograph', 'hierarchy'] },
    { question: 'A grid system helps create consistent alignment.', type: 'true_false', options: ['True', 'False'], correct_answer: 'True', explanation: 'Grids produce rhythmic, aligned layouts.', topic: 'grids', topics: ['grid', 'layout'] },
    { question: 'Why is sufficient color contrast important?', type: 'short_answer', correct_answer: 'Accessibility / readability', explanation: 'Low contrast makes text hard to read, especially for users with vision impairments.', topic: 'accessibility', topics: ['contrast', 'access'] },
  ],
};

// Generic fallback for any skill not matched
const genericKB: KBEntry = {
  keywords: [],
  modules: [
    {
      title: 'Getting Started',
      description: 'Orientation and fundamentals',
      lessons: [
        { title: 'Orientation & Mindset', description: 'Set goals and prepare your environment', objective: 'Define what success looks like for this course', minutes: 20 },
        { title: 'Core Concepts', description: 'Key terminology and mental models', objective: 'Explain 3 key terms in your own words', minutes: 30 },
        { title: 'First Hands-On Exercise', description: 'Apply what you just learned', objective: 'Complete a small guided practice', minutes: 30, type: 'exercise' },
      ],
    },
    {
      title: 'Building Blocks',
      description: 'The most important foundational pieces',
      lessons: [
        { title: 'Common Patterns', description: 'Recognize recurring structures', objective: 'Identify patterns in simple examples', minutes: 25 },
        { title: 'Tools & Workflow', description: 'Set up an efficient workflow', objective: 'Practice using the core tools', minutes: 25 },
        { title: 'Practice Drill', description: 'Short, focused practice', objective: 'Build muscle memory on the fundamentals', minutes: 35, type: 'exercise' },
      ],
    },
    {
      title: 'Applying Your Knowledge',
      description: 'Small projects and problem-solving',
      lessons: [
        { title: 'Troubleshooting & Debugging', description: 'How to diagnose problems', objective: 'Fix 2-3 common issues independently', minutes: 30 },
        { title: 'Mini Project', description: 'Build something small from scratch', objective: 'Ship a tiny working project', minutes: 45, type: 'exercise' },
        { title: 'Review & Reflect', description: 'Identify gaps and next steps', objective: 'Write a reflection note', minutes: 15 },
      ],
    },
  ],
  projects: [
    { title: 'Mini Project: First Build', description: 'Create a small project combining your first lessons.', objective: 'Apply foundations in one small artefact.' },
  ],
  questions: [
    { question: 'What is the difference between recognition and recall when learning?', type: 'multiple_choice', options: ['They are the same', 'Recognition is easier; recall requires retrieving from memory', 'Recall is easier', 'Neither matters for skills'], correct_answer: 'Recognition is easier; recall requires retrieving from memory', explanation: 'Quizzing yourself (recall) strengthens memory much more than re-reading (recognition).', topic: 'learning', topics: ['learn'] },
    { question: 'Spaced repetition is most effective when reviews happen right before you would forget.', type: 'true_false', options: ['True', 'False'], correct_answer: 'True', explanation: 'Spacing reviews at expanding intervals strengthens long-term retention.', topic: 'spaced repetition', topics: ['revis', 'spaced'] },
    { question: 'Why is hands-on practice more effective than passive watching?', type: 'short_answer', correct_answer: 'Active recall / doing builds skills', explanation: 'Active engagement creates stronger memory pathways and reveals what you do not yet understand.', topic: 'practice', topics: ['practic', 'exercise'] },
    { question: 'If you get stuck, what is a good first step?', type: 'multiple_choice', options: ['Give up', 'Skip ahead', 'Restate the problem in your own words and isolate what you do not know', 'Copy the answer without reading'], correct_answer: 'Restate the problem in your own words and isolate what you do not know', explanation: 'Breaking problems down makes them solvable.', topic: 'problem solving', topics: ['stuck', 'debug', 'problem'] },
  ],
};

export const KNOWLEDGE_BASE: KBEntry[] = [pythonKB, reactKB, aiKB, designKB, genericKB];
