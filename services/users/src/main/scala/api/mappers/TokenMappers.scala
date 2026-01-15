package api.mappers

import api.dto.TokensDTO
import model.UserTokens

object TokenMappers:
  extension (tokens: UserTokens)
    def toTokensDTO: TokensDTO =
      TokensDTO(
        accessToken = tokens.accessToken,
        expiresIn = tokens.expiresIn,
        refreshToken = tokens.refreshToken,
        refreshExpiresIn = tokens.refreshExpiresIn
      )
