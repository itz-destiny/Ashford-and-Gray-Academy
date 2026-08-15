import { describe, it, expect, vi, afterEach } from 'vitest';
import { getZoomAccessToken, createZoomMeeting } from './zoom';

const ACCOUNT = { accountId: 'acc_123', clientId: 'client_123', clientSecret: 'secret_123' };

function mockFetchOnce(response: { ok: boolean; status?: number; json?: () => Promise<any>; text?: () => Promise<string> }) {
    return vi.fn().mockResolvedValueOnce({
        ok: response.ok,
        status: response.status ?? (response.ok ? 200 : 400),
        json: response.json ?? (async () => ({})),
        text: response.text ?? (async () => ''),
    });
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('getZoomAccessToken', () => {
    it('throws when credentials are not fully configured', async () => {
        await expect(getZoomAccessToken({ accountId: 'acc_123', clientId: 'client_123', clientSecret: '' })).rejects.toThrow(/not fully configured/);
    });

    it('requests a token with Basic auth of client id/secret and returns access_token', async () => {
        const fetchMock = mockFetchOnce({ ok: true, json: async () => ({ access_token: 'tok_abc' }) });
        vi.stubGlobal('fetch', fetchMock);

        const token = await getZoomAccessToken(ACCOUNT);

        expect(token).toBe('tok_abc');
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('https://zoom.us/oauth/token?grant_type=account_credentials&account_id=acc_123');
        expect(init.method).toBe('POST');
        const expectedAuth = `Basic ${Buffer.from('client_123:secret_123').toString('base64')}`;
        expect(init.headers.Authorization).toBe(expectedAuth);
    });

    it('throws with the response body when the token request fails', async () => {
        const fetchMock = mockFetchOnce({ ok: false, status: 401, text: async () => 'invalid_client' });
        vi.stubGlobal('fetch', fetchMock);

        // Distinct accountId so this doesn't hit the token cache populated by
        // the previous test (the module-level cache is keyed by accountId
        // and persists for the lifetime of the module in this test file).
        await expect(getZoomAccessToken({ ...ACCOUNT, accountId: 'acc_fail' })).rejects.toThrow(/Failed to get Zoom access token: invalid_client/);
    });
});

describe('createZoomMeeting', () => {
    it('fetches a token, then creates a scheduled meeting under the given host email', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'tok_abc' }) })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ id: 123456789, join_url: 'https://zoom.us/j/123', start_url: 'https://zoom.us/s/123' }),
            });
        vi.stubGlobal('fetch', fetchMock);

        const result = await createZoomMeeting({
            topic: 'Week 1: Introduction',
            agenda: 'Course kickoff',
            startTime: '2026-08-01T09:00:00.000Z',
            durationMinutes: 60,
            hostEmail: 'instructor@academy.com',
            account: { ...ACCOUNT, accountId: 'acc_456' },
        });

        expect(result).toEqual({ id: 123456789, join_url: 'https://zoom.us/j/123', start_url: 'https://zoom.us/s/123' });
        expect(fetchMock).toHaveBeenCalledTimes(2);

        const [meetingUrl, meetingInit] = fetchMock.mock.calls[1];
        expect(meetingUrl).toBe('https://api.zoom.us/v2/users/instructor%40academy.com/meetings');
        expect(meetingInit.headers.Authorization).toBe('Bearer tok_abc');

        const body = JSON.parse(meetingInit.body);
        expect(body).toMatchObject({
            topic: 'Week 1: Introduction',
            type: 2,
            start_time: '2026-08-01T09:00:00.000Z',
            duration: 60,
            agenda: 'Course kickoff',
            settings: {
                host_video: true,
                participant_video: true,
                join_before_host: false,
                mute_upon_entry: true,
                waiting_room: true,
                approval_type: 2,
            },
        });
    });

    it('defaults to "me" when no hostEmail is given', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'tok_abc' }) })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, join_url: 'j', start_url: 's' }) });
        vi.stubGlobal('fetch', fetchMock);

        await createZoomMeeting({ topic: 't', startTime: '2026-08-01T09:00:00.000Z', durationMinutes: 30, account: { ...ACCOUNT, accountId: 'acc_789' } });

        const [meetingUrl] = fetchMock.mock.calls[1];
        expect(meetingUrl).toBe('https://api.zoom.us/v2/users/me/meetings');
    });

    it('throws with the response body when meeting creation fails', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'tok_abc' }) })
            .mockResolvedValueOnce({ ok: false, status: 400, text: async () => 'Invalid start_time' });
        vi.stubGlobal('fetch', fetchMock);

        await expect(
            createZoomMeeting({ topic: 't', startTime: 'not-a-date', durationMinutes: 30, account: { ...ACCOUNT, accountId: 'acc_000' } })
        ).rejects.toThrow(/Failed to create Zoom meeting: Invalid start_time/);
    });
});
