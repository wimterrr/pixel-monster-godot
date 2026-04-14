extends Node

const REQUIRED_FIELDS := ["checkpoint_id", "roster_delta", "spent_items"]

func get_required_fields() -> Array:
	return REQUIRED_FIELDS
