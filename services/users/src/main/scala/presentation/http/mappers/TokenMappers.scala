package presentation.http.mappers

import application.dto.UserTokens
import presentation.http.dto.response.auth.TokensDTO

object TokenMappers:
  extension (tokens: UserTokens)
    def toTokensDTO: TokensDTO =
      TokensDTO(
        accessToken = tokens.accessToken,
        expiresIn = tokens.expiresIn,
        refreshToken = tokens.refreshToken,
        refreshExpiresIn = tokens.refreshExpiresIn
      )
