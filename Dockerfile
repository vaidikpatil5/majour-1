# syntax=docker/dockerfile:1

# Use micromamba to build a Conda-based image from environment.yml
FROM mambaorg/micromamba:1.5.6

WORKDIR /app

# Create the conda environment first to leverage build cache on code changes
COPY environment.yml /tmp/environment.yml
RUN micromamba create -y -n docmind-env -f /tmp/environment.yml \
    && micromamba clean --all --yes

# Copy project files
COPY . /app

# Ensure logs show up promptly
ENV PYTHONUNBUFFERED=1

# Default port
ENV PORT=5000
EXPOSE 5000

# Run the app within the conda env
CMD ["micromamba", "run", "-n", "docmind-env", "python", "main.py"]