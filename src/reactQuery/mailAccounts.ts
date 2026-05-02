import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { mailAccountsApi } from '@/api';
import { MailAccount, MailAccountCreatePayload, MailAccountUpdatePayload } from '@/types';
import { MutationHookOptions, QueryHookOptions } from '@/utils/reactQueryCommon';
import { NetworkStatus, useNetworkStore } from '@/store/networkStore';

import { mailAccountQueryKeys } from './queryKeys';

type UpsertMailAccountInput = (MailAccountCreatePayload | MailAccountUpdatePayload) & {
  id?: number;
};

export const useAllMailAccounts = (
  isEnabled = true,
  options?: QueryHookOptions<MailAccount[], typeof mailAccountQueryKeys.all>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: mailAccountQueryKeys.all,
    enabled: isEnabled && networkStatus === NetworkStatus.Online,
    queryFn: () => mailAccountsApi.getAllMailAccounts(),
  });
};

export const useMailAccount = (
  id: number,
  isEnabled = true,
  options?: QueryHookOptions<MailAccount, ReturnType<typeof mailAccountQueryKeys.detail>>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: mailAccountQueryKeys.detail(id),
    enabled: isEnabled && networkStatus === NetworkStatus.Online,
    queryFn: () => mailAccountsApi.getMailAccount(id),
  });
};

export const useUpsertMailAccount = (
  options?: MutationHookOptions<MailAccount, UpsertMailAccountInput>,
) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (mailAccount) => {
      if (mailAccount.id) {
        const { id, ...data } = mailAccount;
        if (typeof data.password === 'string' && data.password.trim() === '') {
          delete data.password;
        }
        return mailAccountsApi.updateMailAccount(id, data as MailAccountUpdatePayload);
      }
      return mailAccountsApi.createMailAccount(mailAccount as MailAccountCreatePayload);
    },
    onSuccess: (mailAccount, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: mailAccountQueryKeys.all });
      client.setQueryData(mailAccountQueryKeys.detail(mailAccount.id), mailAccount);
      options?.onSuccess?.(mailAccount, variables, onMutateResult, context);
    },
  });
};

export const useDeleteMailAccount = (options?: MutationHookOptions<void, number>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id) => mailAccountsApi.deleteMailAccount(id),
    onSuccess: (_, id, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: mailAccountQueryKeys.all });
      client.removeQueries({ queryKey: mailAccountQueryKeys.detail(id) });
      options?.onSuccess?.(_, id, onMutateResult, context);
    },
  });
};

export const useProcessMailAccount = (
  options?: MutationHookOptions<{ result: string }, number>,
) => {
  return useMutation({
    ...options,
    mutationFn: (id) => mailAccountsApi.processMailAccount(id),
  });
};
