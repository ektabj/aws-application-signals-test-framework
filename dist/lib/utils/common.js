"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountName = void 0;
const rip_helper_1 = __importDefault(require("@amzn/rip-helper"));
const constants_1 = require("./constants");
const isOptInRegion = (region) => {
    var _a, _b;
    return (_b = (_a = rip_helper_1.default.getRegion(region)) === null || _a === void 0 ? void 0 : _a.accessibilityAttributes) === null || _b === void 0 ? void 0 : _b.includes('NO_GLOBAL_CREDS');
};
const getAccountName = (stage, region) => {
    if ((isOptInRegion(region) || region == 'us-west-1') && stage === constants_1.Stage.Prod) {
        return `aws-pulse-enablement-test+${stage}-${region}+1`;
    }
    return `aws-pulse-enablement-test+${stage}-${region}`;
};
exports.getAccountName = getAccountName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3V0aWxzL2NvbW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrRUFBeUM7QUFDekMsMkNBQW9DO0FBRXBDLE1BQU0sYUFBYSxHQUFHLENBQUMsTUFBYyxFQUFXLEVBQUU7O0lBQzlDLE9BQU8sTUFBQSxNQUFBLG9CQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQywwQ0FBRSx1QkFBdUIsMENBQUUsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDN0YsQ0FBQyxDQUFDO0FBRUssTUFBTSxjQUFjLEdBQUcsQ0FBQyxLQUFhLEVBQUUsTUFBYyxFQUFVLEVBQUU7SUFDcEUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLElBQUksV0FBVyxDQUFDLElBQUksS0FBSyxLQUFLLGlCQUFLLENBQUMsSUFBSSxFQUFFO1FBQzFFLE9BQU8sNkJBQTZCLEtBQUssSUFBSSxNQUFNLElBQUksQ0FBQztLQUMzRDtJQUNELE9BQU8sNkJBQTZCLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztBQUMxRCxDQUFDLENBQUM7QUFMVyxRQUFBLGNBQWMsa0JBS3pCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJJUEhlbHBlciBmcm9tICdAYW16bi9yaXAtaGVscGVyJztcbmltcG9ydCB7IFN0YWdlIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgRGVwbG95bWVudEVudmlyb25tZW50IH0gZnJvbSAnQGFtem4vcGlwZWxpbmVzJztcbmNvbnN0IGlzT3B0SW5SZWdpb24gPSAocmVnaW9uOiBzdHJpbmcpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gUklQSGVscGVyLmdldFJlZ2lvbihyZWdpb24pPy5hY2Nlc3NpYmlsaXR5QXR0cmlidXRlcz8uaW5jbHVkZXMoJ05PX0dMT0JBTF9DUkVEUycpO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEFjY291bnROYW1lID0gKHN0YWdlOiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICBpZiAoKGlzT3B0SW5SZWdpb24ocmVnaW9uKSB8fCByZWdpb24gPT0gJ3VzLXdlc3QtMScpICYmIHN0YWdlID09PSBTdGFnZS5Qcm9kKSB7XG4gICAgICAgIHJldHVybiBgYXdzLXB1bHNlLWVuYWJsZW1lbnQtdGVzdCske3N0YWdlfS0ke3JlZ2lvbn0rMWA7XG4gICAgfVxuICAgIHJldHVybiBgYXdzLXB1bHNlLWVuYWJsZW1lbnQtdGVzdCske3N0YWdlfS0ke3JlZ2lvbn1gO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBTdGFja1Byb3BzIHtcbiAgICBlbnY6IERlcGxveW1lbnRFbnZpcm9ubWVudDtcbiAgICBzdGFnZTogc3RyaW5nO1xufVxuIl19