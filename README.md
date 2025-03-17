# Chart List Action

This action extracts a list of processed [Helm Charts](https://helm.sh/docs/topics/charts/) (and their basic details) from logs generated by the [`ct`](https://github.com/helm/chart-testing) tool.

## Motivation

For more nuanced chart testing and release automation, a list of updated or to be released charts (and their basic properties like `version`) are often required.
The official Helm tooling has some change-detection logic built-in, but it is either not separately exposed yet or implicitly works only in certain cases. For example:
- [helm/chart-releaser-action](https://github.com/helm/chart-releaser-action) finds charts to be released by inspecting git changes since the last tagged commit
- [`ct list-changed`](https://github.com/helm/chart-testing/blob/76c61a1daac82111ff1623a6d795574bcdb58f34/doc/ct_list-changed.md) compares the current branch with a target one and is therefore of limited use outside of pull requests

Furthermore, even just looking up chart properties by name requires custom processing of `Chart.yaml` files.

Some of the available tools already provide useful information about the processed charts in their logs, though.
In order not to have to reinvent the related logic for more advanced use cases, these usually available logs could be parsed instead to extract reported details.

This helper action does exactly that using the logs generated by the `ct lint` command.
