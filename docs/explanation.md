---
# vim: cc=100 spell
title: Image Similarity Comparison
author: Daniel Csillag
date: 15/10/2019
---

\newpage

Prelude
===

Neural Networks
---

...

\newpage

Finding Similarities Between the Images
===

We want to somehow visualize our set of images based on their similarities — that is, similar
images should be close together, and non-similar ones should be far away.

All the approaches given below following a common idea: map each image to some vector in
$\mathbb{R}^n$, and then use some dimensionality reduction procedure in order to visualize it.

Mapping images to vectors
---

### Approach #1: MobileNet Logits

This is the approach used in [Vikus Viewer](...).

TODO

#### Cosine Similarity

TODO

### Approach #2: VGG-16 Feature Vectors

This was inspired by [...](...).

TODO

#### Cosine Similarity

TODO

Dimensionality Reduction: t-SNE
---

TODO

\newpage

Preparing the Dataset
===

When making effective interfaces, it is good practice to preprocess whatever possible to avoid
excessive computation at runtime. In this project, several things were preprocessed, and are now
explained:

Finding the images' geolocation
---

TODO

Finding the images' similarities
---

The procedure explained in the "Finding Similarities Between the Images" section.

All that is stored in the database is the X and Y coordinates of the t-SNE visualization of the
images' vectors.

Implementing the Interface
===

...
