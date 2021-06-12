/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { AdditionalContentContext, User, WorkspaceContext } from "@gitpod/gitpod-protocol";
import { log } from "@gitpod/gitpod-protocol/lib/util/logging";
import { base64decode } from "@jmondi/oauth2-server";
import { inject, injectable } from "inversify";
import { Env } from "../env";
import { IPrefixContextParser } from "./context-parser";


/**
 * mostly for testing purpose
 */
@injectable()
export class AdditionalContentPrefixContextParser implements IPrefixContextParser {
    @inject(Env) protected readonly env: Env;
    static PREFIX = /^\/?additionalcontent\/([^\/]*)\//;

    findPrefix(user: User, context: string): string | undefined {
        if (this.env.hostUrl.url.host !== 'gitpod.io') {
            const result = AdditionalContentPrefixContextParser.PREFIX.exec(context);
            if (result) {
                return result[0];
            }
        }
        log.error("Someone tried additionalcontent URL prefix.", {context});
        return undefined;
    }

    public async handle(user: User, prefix: string, context: WorkspaceContext): Promise<WorkspaceContext> {
        const match = AdditionalContentPrefixContextParser.PREFIX.exec(prefix);
        if (!match) {
            log.error('Could not parse prefix ' + prefix);
            return context;
        }
        const text = base64decode(decodeURIComponent(match[1]));
        const files = JSON.parse(text);
        (context as any as AdditionalContentContext).additionalFiles = files
        return context;
    }
}
