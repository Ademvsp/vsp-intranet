export const projectStatusTypeNames = {
	EXPRESSION_OF_INTEREST: 'Expression of Interest',
	PROOF_OF_CONCEPT: 'Proof of Concept',
	AWAITING_QUOTATION_RESPONSE: 'Awaiting Quotation Response',
	CLOSED_STALE: 'Closed (Stale)',
	QUOTATION_STAGE: 'Quotation Stage',
	ON_HOLD: 'On Hold',
	CLOSED_LOST: 'Closed (Lost)',
	CLOSED_WON: 'Closed (Won)'
};

export default [
	{
		statusId: projectStatusTypeNames.EXPRESSION_OF_INTEREST.toLowerCase(),
		name: projectStatusTypeNames.EXPRESSION_OF_INTEREST,
		oldId: '1cqBSbKXco7uujPmmeYF'
	},
	{
		statusId: projectStatusTypeNames.PROOF_OF_CONCEPT.toLowerCase(),
		name: projectStatusTypeNames.PROOF_OF_CONCEPT,
		oldId: '39kLFtf3zOR7Pd3xCRz3'
	},
	{
		statusId: projectStatusTypeNames.AWAITING_QUOTATION_RESPONSE.toLocaleLowerCase(),
		name: projectStatusTypeNames.AWAITING_QUOTATION_RESPONSE,
		oldId: '8OZQGFkzkRYRoYbECYJG'
	},
	{
		statusId: projectStatusTypeNames.CLOSED_STALE.toLocaleLowerCase(),
		name: projectStatusTypeNames.CLOSED_STALE,
		oldId: 'DmIJav2dI4hlg7n8EF42'
	},
	{
		statusId: projectStatusTypeNames.QUOTATION_STAGE.toLocaleLowerCase(),
		name: projectStatusTypeNames.QUOTATION_STAGE,
		oldId: 'QVxz2KvdH2rhRpPPEOmf'
	},
	{
		statusId: projectStatusTypeNames.ON_HOLD.toLocaleLowerCase(),
		name: projectStatusTypeNames.ON_HOLD,
		oldId: 'ZQv3E7isEpw48HjfBE4G'
	},
	{
		statusId: projectStatusTypeNames.CLOSED_LOST.toLocaleLowerCase(),
		name: projectStatusTypeNames.CLOSED_LOST,
		oldId: 'sW9iWNXGKgLOqYRAd8iV'
	},
	{
		statusId: projectStatusTypeNames.CLOSED_WON.toLocaleLowerCase(),
		name: projectStatusTypeNames.CLOSED_WON,
		oldId: 'waG5jWQOXB76bDmTgJGF'
	}
];
