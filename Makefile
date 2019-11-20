#!make

help: ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

deploy_dev: ## Deploy ped-table-soccer-dev app
	@bash scripts/deploy-dev.sh

deploy_prod: ## Deploy ped-table-soccer app [needs firebase token]
	@bash scripts/deploy-prod.sh

deploy_functions_dev: ## Deploy ped-table-soccer-dev functions
	@bash scripts/deploy-functions.sh development

deploy_functions_prod: ## Deploy ped-table-soccer functions
	@bash scripts/deploy-functions.sh production
