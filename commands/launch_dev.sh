export server_env="DEV"
# Activate conda environment if using conda
# conda activate docmind-env
python -m flask --app docmind run --debug
