# Tools

This directory contains utility scripts and tools.

## Utility tools

### Terraform execution flow

To run Terraform commands with MFA authentication and proper environment variable loading, combine the two scripts as follows:

```bash
dotenvx run -f ../../.env  -- terraform <terraform-command> [options]
```

#### Examples

**Run `terraform plan`:**

```bash
dotenvx run -f ../../.env  -- terraform plan
```

**Run `terraform apply`:**

```bash
dotenvx run -f ../../.env  -- terraform apply
```
