#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { BedrockChatStack } from "../lib/bedrock-chat-stack";
import { BedrockRegionResourcesStack } from "../lib/bedrock-region-resources";
import { LogRetentionChecker } from "../rules/log-retention-checker";
import { getBedrockChatParameters } from "../lib/utils/parameter-models";
import { bedrockChatParams } from "../parameter";

const app = new cdk.App();

// Specify env name by "envName" context variable
// ex) cdk synth -c envName=foo
// If you don't specify the envName context variable, "default" is used.
const params = getBedrockChatParameters(
  app,
  app.node.tryGetContext("envName"),
  bedrockChatParams
);

// // Another way, you can iterate over params map to declare multiple environments in single App.
// for (const [k] of bedrockChatParams) {
//   const params = getBedrockChatParameters(app, k, bedrockChatParams);
//   // Include stack declaration this scope...
// }

const sepHyphen = params.envPrefix ? "-" : "";


// The region of the LLM model called by the converse API and the region of Guardrail must be in the same region.
// CustomBotStack contains Knowledge Bases is deployed in the same region as the LLM model, and source bucket must be in the same region as Knowledge Bases.
// Therefore, define BedrockRegionResourcesStack containing the source bucket in the same region as the LLM model.
// Ref: https://docs.aws.amazon.com/bedrock/latest/userguide/s3-data-source-connector.html
const bedrockRegionResources = new BedrockRegionResourcesStack(
  app,
  `${params.envPrefix}${sepHyphen}BedrockRegionResourcesStack`,
  {
    env: {
      // account: process.env.CDK_DEFAULT_ACCOUNT,
      region: params.bedrockRegion,
    },
    crossRegionReferences: true,
  }
);

const chat = new BedrockChatStack(
  app,
  `${params.envPrefix}${sepHyphen}BedrockChatStack`,
  {
    env: {
      // account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    envName: params.envName,
    envPrefix: params.envPrefix,
    crossRegionReferences: true,
    bedrockRegion: params.bedrockRegion,
    enableIpV6: true,
    identityProviders: params.identityProviders,
    userPoolDomainPrefix: params.userPoolDomainPrefix,
    publishedApiAllowedIpV4AddressRanges:
      params.publishedApiAllowedIpV4AddressRanges,
    publishedApiAllowedIpV6AddressRanges:
      params.publishedApiAllowedIpV6AddressRanges,
    allowedSignUpEmailDomains: params.allowedSignUpEmailDomains,
    autoJoinUserGroups: params.autoJoinUserGroups,
    selfSignUpEnabled: params.selfSignUpEnabled,
    documentBucket: bedrockRegionResources.documentBucket,
    useStandbyReplicas: params.enableRagReplicas,
    enableBedrockCrossRegionInference: params.enableBedrockCrossRegionInference,
    enableLambdaSnapStart: params.enableLambdaSnapStart,
    alternateDomainName: params.alternateDomainName,
    hostedZoneId: params.hostedZoneId,
  }
);
chat.addDependency(bedrockRegionResources);

cdk.Aspects.of(chat).add(new LogRetentionChecker());
cdk.Tags.of(app).add("CDKEnvironment", params.envName);
