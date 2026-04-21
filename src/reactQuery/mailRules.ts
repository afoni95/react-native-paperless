import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { mailRulesApi } from '@/api';
import {
  MailRule,
  MailRuleCreatePayload,
  MailRuleUpdatePayload,
} from '@/types';
import { MutationHookOptions, QueryHookOptions } from '@/utils/reactQueryCommon';

import { mailRuleQueryKeys } from './queryKeys';

type UpsertMailRuleInput = (MailRuleCreatePayload | MailRuleUpdatePayload) & {
  id?: number;
};

export const useAllMailRules = (
  isEnabled = true,
  options?: QueryHookOptions<MailRule[], typeof mailRuleQueryKeys.all>,
) => {
  return useQuery({
    ...options,
    queryKey: mailRuleQueryKeys.all,
    enabled: isEnabled,
    queryFn: () => mailRulesApi.getAllMailRules(),
  });
};

export const useMailRule = (
  id: number,
  isEnabled = true,
  options?: QueryHookOptions<MailRule, ReturnType<typeof mailRuleQueryKeys.detail>>,
) => {
  return useQuery({
    ...options,
    queryKey: mailRuleQueryKeys.detail(id),
    enabled: isEnabled,
    queryFn: () => mailRulesApi.getMailRule(id),
  });
};

export const useUpsertMailRule = (
  options?: MutationHookOptions<MailRule, UpsertMailRuleInput>,
) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (mailRule) => {
      if (mailRule.id) {
        const { id, ...data } = mailRule;
        return mailRulesApi.updateMailRule(id, data as MailRuleUpdatePayload);
      }
      return mailRulesApi.createMailRule(mailRule as MailRuleCreatePayload);
    },
    onSuccess: (mailRule, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: mailRuleQueryKeys.all });
      client.setQueryData(mailRuleQueryKeys.detail(mailRule.id), mailRule);
      options?.onSuccess?.(mailRule, variables, onMutateResult, context);
    },
  });
};

export const useDeleteMailRule = (options?: MutationHookOptions<void, number>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id) => mailRulesApi.deleteMailRule(id),
    onSuccess: (_, id, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: mailRuleQueryKeys.all });
      client.removeQueries({ queryKey: mailRuleQueryKeys.detail(id) });
      options?.onSuccess?.(_, id, onMutateResult, context);
    },
  });
};
